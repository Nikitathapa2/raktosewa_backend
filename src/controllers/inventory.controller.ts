import { Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service';

export const getMyInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const data = await inventoryService.getInventory(req.user._id, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
    
    // Check if data has pagination structure
    if ('pagination' in data) {
      res.status(200).json({
        success: true,
        ...data,
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Inventory retrieved successfully',
        data: data,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBloodStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const data = await inventoryService.getAllStockGroupedByOrganization(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined
    );
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await inventoryService.updateInventory(req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bloodGroup } = req.params;
    const data = await inventoryService.deleteInventory(req.user._id, bloodGroup as any);
    if (!data) {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Inventory deleted successfully',
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllStockByOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const data = await inventoryService.getAllInventoryWithOrganization(
   
    );
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};