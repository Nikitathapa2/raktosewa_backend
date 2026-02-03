import bcrypt from "bcryptjs";
import { DonorUserModel } from "../models/DonorUser.model";
import { OrganizationUserModel } from "../models/OrganizationUser.model";

/* ----------------------------------
   Test Users Seeding
   Creates sample donor and organization users for testing
----------------------------------- */
export const seedTestUsers = async () => {
  try {
    // Check if test users already exist
    const donorCount = await DonorUserModel.countDocuments({});
    const orgCount = await OrganizationUserModel.countDocuments({});

    if (donorCount > 0 || orgCount > 0) {
      console.log("✓ Test users already exist");
      return;
    }

    // Seed test donor users
    const donorPassword = await bcrypt.hash("Donor@123456", 10);
    const donors = [
      {
        fullName: "Ahmed Hassan",
        email: "ahmed.hassan@example.com",
        password: donorPassword,
        phoneNumber: "+880 1712345678",
        dateOfBirth: "1990-05-15",
        bloodGroup: "O+",
        address: "Dhaka, Bangladesh",
        userType: "donor" as const,
        role: "user",
      },
      {
        fullName: "Fatima Begum",
        email: "fatima.begum@example.com",
        password: donorPassword,
        phoneNumber: "+880 1798765432",
        dateOfBirth: "1995-03-20",
        bloodGroup: "B+",
        address: "Chittagong, Bangladesh",
        userType: "donor" as const,
        role: "user",
      },
      {
        fullName: "Karim Khan",
        email: "karim.khan@example.com",
        password: donorPassword,
        phoneNumber: "+880 1702468135",
        dateOfBirth: "1988-07-10",
        bloodGroup: "A+",
        address: "Sylhet, Bangladesh",
        userType: "donor" as const,
        role: "user",
      },
    ];

    const createdDonors = await DonorUserModel.insertMany(donors);
    console.log(`✓ Created ${createdDonors.length} test donor users`);

    // Seed test organization users
    const orgPassword = await bcrypt.hash("Org@123456", 10);
    const organizations = [
      {
        organizationName: "Bangladesh Red Crescent Society",
        headOfOrganization: "Dr. Mohammad Ershad",
        email: "contact@redcrescent.bd",
        password: orgPassword,
        phoneNumber: "+880 2-8801201",
        address: "Dhaka, Bangladesh",
        userType: "organization" as const,
        role: "user",
      },
      {
        organizationName: "International Committee of the Red Cross",
        headOfOrganization: "Peter Maurer",
        email: "bangladesh@icrc.org",
        password: orgPassword,
        phoneNumber: "+880 2-9140022",
        address: "Dhaka, Bangladesh",
        userType: "organization" as const,
        role: "user",
      },
      {
        organizationName: "United Nations High Commissioner for Refugees",
        headOfOrganization: "Filippo Grandi",
        email: "bangladesh@unhcr.org",
        password: orgPassword,
        phoneNumber: "+880 2-9141900",
        address: "Dhaka, Bangladesh",
        userType: "organization" as const,
        role: "user",
      },
    ];

    const createdOrgs = await OrganizationUserModel.insertMany(organizations);
    console.log(`✓ Created ${createdOrgs.length} test organization users`);

    console.log("\n✓ Test users seeded successfully!");
    console.log("\nTest Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Donors (Password: Donor@123456)");
    donors.forEach(d => console.log(`  - ${d.email}`));
    console.log("\nOrganizations (Password: Org@123456)");
    organizations.forEach(o => console.log(`  - ${o.email}`));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("✗ Error seeding test users:", error);
    throw error;
  }
};
