import { BloodInventoryModel, IBloodInventory, BloodGroup } from '../models/bloodInventory.model';
import mongoose from 'mongoose';
import { parsePaginationParams, createPaginatedResponse, PaginatedResponse } from '../utils/pagination';
import { IOrganizationUser } from '../models/OrganizationUser.model';

interface InventoryUpdate {
  bloodGroup: BloodGroup;
  quantity: number;
  operation: 'add' | 'subtract' | 'set';
}

export const getInventory = async (
  organizationId: string | mongoose.Types.ObjectId,
  page?: number | string,
  limit?: number | string
): Promise<IBloodInventory[] | PaginatedResponse<IBloodInventory>> => {
  // If pagination params provided, return paginated response
  if (page || limit) {
    const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

    const totalItems = await BloodInventoryModel.countDocuments({ organization: organizationId });

    const inventory = await BloodInventoryModel.find({ organization: organizationId })
      .populate('organization', 'organizationName email phoneNumber')
      .skip(skip)
      .limit(pageSize)
      .sort({ bloodGroup: 1 });

    return createPaginatedResponse(inventory, totalItems, pageNum, pageSize);
  }

  // Otherwise return all items (for backward compatibility)
  return await BloodInventoryModel.find({ organization: organizationId })
    .populate('organization', 'organizationName email phoneNumber')
    .sort({ bloodGroup: 1 });
};

export const updateInventory = async (
  organizationId: string | mongoose.Types.ObjectId,
  updates: InventoryUpdate
): Promise<IBloodInventory> => {
  const { bloodGroup, quantity, operation } = updates;

  let inventoryItem = await BloodInventoryModel.findOne({ 
    organization: organizationId, 
    bloodGroup 
  });

  if (!inventoryItem) {
    if (operation === 'subtract') throw new Error('Inventory not found for this blood group');
    inventoryItem = new BloodInventoryModel({
      organization: organizationId,
      bloodGroup,
      quantity: 0
    });
  }

  if (operation === 'add') {
    inventoryItem.quantity += quantity;
  } else if (operation === 'subtract') {
    if (inventoryItem.quantity < quantity) throw new Error('Insufficient inventory');
    inventoryItem.quantity -= quantity;
  } else if (operation === 'set') {
    inventoryItem.quantity = quantity;
  }

  return await inventoryItem.save();
};

export const deleteInventory = async (
  organizationId: string | mongoose.Types.ObjectId,
  bloodGroup: BloodGroup
): Promise<IBloodInventory | null> => {
  return await BloodInventoryModel.findOneAndDelete({
    organization: organizationId,
    bloodGroup
  });
};

export const getAllStock = async (
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<IBloodInventory>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  // Get all inventory items first to filter after population
  const allInventory = await BloodInventoryModel.find()
    .populate('organization', 'organizationName email phoneNumber address');

  // Filter out items with null organization (orphaned records)
  const validInventory = allInventory.filter((item) => item.organization !== null);

  // Calculate total items and apply pagination on filtered data
  const totalItems = validInventory.length;
  const paginatedInventory = validInventory.slice(skip, skip + pageSize);

  return createPaginatedResponse(paginatedInventory, totalItems, pageNum, pageSize);
};

interface OrganizationStockData {
  organization: {
    _id: string;
    organizationName: string;
    email: string;
    phoneNumber: string;
    address: string;
  };
  bloodStock: {
    bloodGroup: string;
    quantity: number;
  }[];
  totalUnits: number;
}

const BLOOD_GROUP_ORDER = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];


export const getAllStockGroupedByOrganization = async (
  page?: number | string,
  limit?: number | string
): Promise<{ success: boolean; data: OrganizationStockData[]; pagination: any }> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  try {
    console.log('📦 Fetching all blood inventory...');
    
    // Fetch all inventory and populate the organization from OrganizationUser
    const allInventory = await BloodInventoryModel.find()
      .populate('organization', 'organizationName email phoneNumber address')
      .sort({ 'organization._id': 1, bloodGroup: 1 });

    console.log(`✅ Found ${allInventory.length} total inventory items`);
    
    if (allInventory.length === 0) {
      console.log('⚠️  No inventory records found in database');
      return {
        success: true,
        data: [],
        pagination: { totalItems: 0, totalPages: 0, currentPage: pageNum, pageSize },
      };
    }

    // Log first item to debug populate
    console.log('🔍 First inventory item structure:', JSON.stringify(allInventory[0], null, 2));

    // Filter out any items where organization is null (populate failed)
    const validInventory = allInventory.filter(item => item.organization !== null);
    const nullCount = allInventory.length - validInventory.length;

    if (nullCount > 0) {
      console.log(`⚠️  WARNING: ${nullCount} items have null organization (populate failed)`);
      console.log('   This means the organization ObjectIds don\'t exist in OrganizationUser collection');
    }

    console.log(`✅ After filtering: ${validInventory.length} valid items`);

    // Group inventory per organization
    const organizationMap: { [orgId: string]: OrganizationStockData } = {};

    validInventory.forEach(item => {
      const org = item.organization as unknown as IOrganizationUser;
      const orgId = org._id.toString();

      if (!organizationMap[orgId]) {
        organizationMap[orgId] = {
          organization: {
            _id: orgId,
            organizationName: org.organizationName || 'Unknown Org',
            email: org.email || 'N/A',
            phoneNumber: org.phoneNumber || 'N/A',
            address: org.address || 'N/A',
          },
          bloodStock: [],
          totalUnits: 0,
        };
      }

      organizationMap[orgId].bloodStock.push({
        bloodGroup: item.bloodGroup,
        quantity: item.quantity,
      });

      organizationMap[orgId].totalUnits += item.quantity;
    });

    // Sort blood groups within each organization
    const organizationStockArray = Object.values(organizationMap).map(org => ({
      ...org,
      bloodStock: org.bloodStock.sort(
        (a, b) => BLOOD_GROUP_ORDER.indexOf(a.bloodGroup) - BLOOD_GROUP_ORDER.indexOf(b.bloodGroup)
      ),
    }));

    // Apply pagination
    const totalItems = organizationStockArray.length;
    const paginatedData = organizationStockArray.slice(skip, skip + pageSize);

    console.log(`📊 Final response: ${paginatedData.length} organizations (total: ${totalItems})`);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: pageNum,
        pageSize,
      },
    };
  } catch (error) {
    console.error('❌ Error in getAllStockGroupedByOrganization:', error);
    throw error;
  }
};

export const getAllInventoryWithOrganization = async () => {
  const allInventory = await BloodInventoryModel.find()
    .populate('organization', 'organizationName email phoneNumber address')
    .sort({ 'organization._id': 1, bloodGroup: 1 });

  return {
    success: true,
    data: allInventory,
  };
};

/**
 * Migration function: Remove orphaned blood inventory records with null organization
 * Call this once to clean up bad data from the database
 */
export const cleanupOrphanedInventory = async () => {
  try {
    console.log('🧹 Starting cleanup of orphaned inventory records...');
    
    const result = await BloodInventoryModel.deleteMany({ organization: null });
    
    console.log(`✅ Deleted ${result.deletedCount} orphaned inventory records`);
    
    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Cleaned up ${result.deletedCount} orphaned records`,
    };
  } catch (error) {
    console.error('❌ Error cleaning up orphaned inventory:', error);
    throw error;
  }
};