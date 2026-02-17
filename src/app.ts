// app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Route imports
import authRoutes from './routes/auth.routes';
import donationRoutes from './routes/donation.routes';
import donorUserRoutes from './routes/donorUser.routes';
import organizationUserRoutes from './routes/organizationUser.routes';
import inventoryRoutes from './routes/inventory.routes';
import campaignRoutes from './routes/campaign.routes';
import requestRoutes from './routes/request.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin/user.route';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/uploads', express.static('public'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/donor', donorUserRoutes);
app.use('/api/v1/organization', organizationUserRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.send('Raktosewa Backend API is Running');
});

export default app;
