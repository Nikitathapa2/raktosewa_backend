const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Load Models
const User = require('../models/user.model');
const DonorProfile = require('../models/donorProfile.model');
const OrganizationProfile = require('../models/organizationProfile.model');
const OrganizationUser = require('../models/OrganizationUser.model');
const BloodInventory = require('../models/bloodInventory.model');
const BloodRequest = require('../models/bloodRequest.model');
const Campaign = require('../models/campaign.model');
const Donation = require('../models/donation.model');

// Connect DB
mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
  try {
    // Clear existing data (Be careful in production!)
    // For safety, checking if Admin exists, if so, maybe skip clearing or clean selective?
    // Instruction says "Seeders must NOT duplicate data on re-run".
    
    // Check if seeded already
    const adminExists = await User.findOne({ email: 'admin@raktosewa.com' });
    if (adminExists) {
        console.log('Data already seeded (Admin exists). Exiting...');
        process.exit();
    }

    // 1. Create Users
    // Hash password manually here since we use create (or use save() on instance to trigger pre-save hook)
    // Using pre-save hook means we should create instances and save, or use create which triggers hooks
    // but bulk insert insertMany does NOT trigger hooks. We will use loop/create for safety.
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // ADMIN
    const adminUser = await User.create({
        email: 'admin@raktosewa.com',
        password: 'password123', // Hook will hash it? No, wait. 
        // If I pass 'password123', the hook in model will hash it.
        // Let's rely on model hook.
        role: 'ADMIN',
        isVerified: true
    });

    // ORGANIZATION - Create OrganizationUser (for blood inventory reference)
    const orgUser = await OrganizationUser.create({
        organizationName: 'City Hospital',
        headOfOrganization: 'Dr. Sharma',
        email: 'org@hospital.com',
        password: 'password123',
        phoneNumber: '9800000000',
        address: 'Kathmandu, Nepal',
        userType: 'organization',
        isEmailVerified: true
    });

    // DONOR
    const donorUser = await User.create({
        email: 'donor@gmail.com',
        password: 'password123',
        role: 'DONOR',
        isVerified: true
    });

    await DonorProfile.create({
        user: donorUser._id,
        name: 'Ram Bahadur',
        bloodGroup: 'O+',
        phone: '9811111111',
        address: 'Lalitpur, Nepal',
        dob: new Date('1995-01-01'),
        gender: 'MALE',
        lastDonationDate: new Date('2025-01-01')
    });

    // 2. Inventory
    await BloodInventory.create({
        organization: orgUser._id,
        bloodGroup: 'O+',
        quantity: 10
    });
    await BloodInventory.create({
        organization: orgUser._id,
        bloodGroup: 'A-',
        quantity: 5
    });

    // 3. Blood Request
    await BloodRequest.create({
        organization: orgUser._id,
        patientName: 'Sita Devi',
        bloodGroup: 'AB+',
        unitsRequired: 2,
        urgency: 'CRITICAL',
        location: 'City Hospital ICU',
        contactNumber: '9800000000',
        status: 'PENDING'
    });

    // 4. Campaign
    await Campaign.create({
        organization: orgUser._id,
        title: 'New Year Donation Drive',
        description: 'Join us to save lives this new year.',
        date: new Date('2026-04-14'), // Future date
        startTime: '10:00 AM',
        endTime: '4:00 PM',
        location: 'Basantapur Durbar Square'
    });

    // 5. Walk-in Donation
    await Donation.create({
        organization: orgUser._id,
        donorType: 'WALKIN',
        walkinDonor: {
            name: 'Hari Krishna',
            phone: '9822222222',
            bloodGroup: 'A+',
            age: 30,
            gender: 'MALE'
        },
        bloodGroup: 'A+',
        units: 1
    });

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
    // Implement if needed for reset
    try {
        await User.deleteMany();
        await DonorProfile.deleteMany();
        await OrganizationProfile.deleteMany();
        await BloodInventory.deleteMany();
        await BloodRequest.deleteMany();
        await Campaign.deleteMany();
        await Donation.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
}

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
