import { DonorUserModel } from '../../models/DonorUser.model';
import { OrganizationUserModel } from '../../models/OrganizationUser.model';
import { BloodInventoryModel } from '../../models/bloodInventory.model';
import { CampaignModel } from '../../models/campaign.model';

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export class AdminDashboardService {
  async getDashboardStats() {
    const startOfToday = getStartOfToday();

    const [totalDonors, totalRegisteredOrganizations, ongoingCampaigns, bloodUnitsAggregate] =
      await Promise.all([
        DonorUserModel.countDocuments({}),
        OrganizationUserModel.countDocuments({}),
        CampaignModel.countDocuments({ date: { $gte: startOfToday } }),
        BloodInventoryModel.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]),
      ]);

    const totalBloodUnits = bloodUnitsAggregate?.[0]?.total ?? 0;

    return {
      totalDonors,
      ongoingCampaigns,
      totalBloodUnits,
      totalRegisteredOrganizations,
    };
  }
}
