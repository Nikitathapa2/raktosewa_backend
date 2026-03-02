import { Request, Response, NextFunction } from 'express';
import { AdminDashboardService } from '../../services/admin/dashboard.service';

const adminDashboardService = new AdminDashboardService();

export class AdminDashboardController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminDashboardService.getDashboardStats();

      return res.status(200).json({
        success: true,
        message: 'Dashboard stats fetched successfully',
        data,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || 'Error fetching dashboard stats',
      });
    }
  }
}
