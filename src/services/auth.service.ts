import { UserModel, IUser } from '../models/user.model';
import { DonorProfileModel } from '../models/donorProfile.model';
import { OrganizationProfileModel } from '../models/organizationProfile.model';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

interface RegisterUserData {
  email: string;
  password: string;
  role: 'ADMIN' | 'DONOR' | 'ORGANIZATION';
  profileData: any;
}

interface AuthResponse {
  _id: mongoose.Types.ObjectId;
  email: string;
  role: string;
  token: string;
  profile?: any;
}

const generateToken = (id: mongoose.Types.ObjectId): string => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET || '', {
    expiresIn: '30d',
  });
};

export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  const { email, password, role, profileData } = userData;

  // Check if user exists
  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  // Create User
  const user = await UserModel.create({
    email,
    password,
    role,
  });

  // Create Profile based on role
  if (role === 'DONOR') {
    await DonorProfileModel.create({
      user: user._id,
      ...profileData,
    });
  } else if (role === 'ORGANIZATION') {
    await OrganizationProfileModel.create({
      user: user._id,
      ...profileData,
    });
  }

  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const user = await UserModel.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    let profile = null;
    if (user.role === 'DONOR') {
      profile = await DonorProfileModel.findOne({ user: user._id });
    } else if (user.role === 'ORGANIZATION') {
      profile = await OrganizationProfileModel.findOne({ user: user._id });
    }

    return {
      _id: user._id,
      email: user.email,
      role: user.role,
      profile,
      token: generateToken(user._id),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};
