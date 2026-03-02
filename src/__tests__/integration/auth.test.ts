import app from "../../app";
import { AdminUserModel } from "../../models/AdminUser.model";
import { DonorUserModel } from "../../models/DonorUser.model";
import { OrganizationUserModel } from "../../models/OrganizationUser.model";
import request from 'supertest';

describe('Admin Integration Tests - Complete Suite (25 Tests)', () => {
    let adminToken: string;
    let adminUserId: string;
    let createdDonorId: string;
    let createdOrgId: string;

    // Test data
    const adminTestUser = {
        email: 'admin@test.com',
        password: 'admin123456',
    };

    const donorTestUser = {
        fullName: 'Test Donor',
        email: 'donor@test.com',
        password: 'donor123456',
        bloodGroup: 'O+',
        phoneNumber: '1234567890',
        address: 'Test Address',
        dateOfBirth: '1990-01-01',
        userType: 'donor'
    };

    const organizationTestUser = {
        organizationName: 'Test Organization',
        headOfOrganization: 'John Doe',
        email: 'org@test.com',
        password: 'org123456',
        phoneNumber: '9876543210',
        address: 'Organization Address',
        userType: 'organization'
    };

    beforeAll(async () => {
        // Clean up test data
        await AdminUserModel.deleteMany({ email: { $in: [adminTestUser.email, 'admin2@test.com'] } });
        await DonorUserModel.deleteMany({ email: { $in: [donorTestUser.email, 'donor2@test.com', 'donor3@test.com'] } });
        await OrganizationUserModel.deleteMany({ email: { $in: [organizationTestUser.email, 'org2@test.com'] } });
    });

    afterAll(async () => {
        // Clean up created test data
        await AdminUserModel.deleteMany({ email: { $in: [adminTestUser.email, 'admin2@test.com'] } });
        await DonorUserModel.deleteMany({ email: { $in: [donorTestUser.email, 'donor2@test.com', 'donor3@test.com'] } });
        await OrganizationUserModel.deleteMany({ email: { $in: [organizationTestUser.email, 'org2@test.com'] } });
    });

    // ===== ADMIN REGISTRATION & LOGIN TESTS (5 tests) =====
    describe("1. Admin Registration - POST /api/v1/admin/register", () => {
        it("should register new admin successfully with valid credentials (201)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/register")
                .send(adminTestUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("message", "Admin registered successfully");
            expect(response.body.data).toHaveProperty("email", adminTestUser.email);
            expect(response.body.data).toHaveProperty("id");
            adminUserId = response.body.data.id;
        });

        it("should fail to register admin with duplicate email (409)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/register")
                .send(adminTestUser)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain("Admin email already in use");
        });

        it("should fail admin registration with missing email (400)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/register")
                .send({ password: 'admin123456' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain("Email and password are required");
        });

        it("should fail admin registration with missing password (400)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/register")
                .send({ email: 'admin2@test.com' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain("Email and password are required");
        });

   
    });

    describe("2. Admin Login - POST /api/v1/admin/login", () => {
        it("should login admin successfully with valid credentials (200)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/login")
                .send(adminTestUser)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("message", "Admin login successful");
            expect(response.body).toHaveProperty("token");
            expect(response.body.user).toHaveProperty("email", adminTestUser.email);
            expect(response.body.user).toHaveProperty("role", "admin");
            adminToken = response.body.token;
        });

        it("should fail login with wrong password (401)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/login")
                .send({ email: adminTestUser.email, password: 'wrongpassword' })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it("should fail login with non-existent email (401)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/login")
                .send({ email: 'nonexistent@test.com', password: 'admin123456' })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it("should fail login with missing email (400)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/login")
                .send({ password: 'admin123456' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain("Email and password are required");
        });

        it("should fail login with missing password (400)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/login")
                .send({ email: adminTestUser.email })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain("Email and password are required");
        });
    });

    // ===== CREATE USER TESTS (4 tests) =====
    describe("3. Create User - POST /api/v1/admin/users", () => {
        it("should create new donor user successfully (201)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(donorTestUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User created successfully");
            expect(response.body.data).toHaveProperty("email", donorTestUser.email);
            expect(response.body.data).toHaveProperty("fullName", donorTestUser.fullName);
            expect(response.body.data).toHaveProperty("bloodGroup", donorTestUser.bloodGroup);
            createdDonorId = response.body.data._id;
        });

        it("should create new organization user successfully (201)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(organizationTestUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User created successfully");
            expect(response.body.data).toHaveProperty("email", organizationTestUser.email);
            expect(response.body.data).toHaveProperty("organizationName", organizationTestUser.organizationName);
            createdOrgId = response.body.data._id;
        });

        it("should fail create user without authentication (401/403)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/users")
                .send(donorTestUser);

            expect([401, 403]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });

        it("should fail create user with duplicate email (409)", async () => {
            const response = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(donorTestUser)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain("Email already in use");
        });

        it("should fail create user with missing required fields (400)", async () => {
            const invalidUser = {
                email: 'incomplete@test.com',
                password: 'pass123456'
                // Missing fullName, bloodGroup, userType
            };

            const response = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it("should fail create user with invalid blood group (400)", async () => {
            const invalidUser = {
                ...donorTestUser,
                email: 'donor2@test.com',
                bloodGroup: 'INVALID'
            };

            const response = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it("should fail create user with password too short (400)", async () => {
            const invalidUser = {
                ...donorTestUser,
                email: 'donor3@test.com',
                password: 'short'
            };

            const response = await request(app)
                .post("/api/v1/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    // ===== GET ALL USERS TEST (1 test) =====
    describe("4. Get All Users - GET /api/v1/admin/users", () => {
        it("should retrieve all users successfully (200)", async () => {
            const response = await request(app)
                .get("/api/v1/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("All users retrieved successfully");
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toHaveProperty("totalItems");
            expect(response.body.pagination.totalItems).toBeGreaterThanOrEqual(2);
        });

        it("should fail to get users without authentication (401/403)", async () => {
            const response = await request(app)
                .get("/api/v1/admin/users");

            expect([401, 403]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });
    });

    // ===== GET USER BY ID TESTS (2 tests) =====
    describe("5. Get User by ID - GET /api/v1/admin/users/:id", () => {
        it("should retrieve user by ID successfully (200)", async () => {
            const response = await request(app)
                .get(`/api/v1/admin/users/${createdDonorId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User retrieved successfully");
            expect(response.body.data._id).toBe(createdDonorId);
            expect(response.body.data.email).toBe(donorTestUser.email);
        });

        it("should fail to get user with invalid ID (404/500)", async () => {
            const response = await request(app)
                .get("/api/v1/admin/users/invalid-id-12345")
                .set("Authorization", `Bearer ${adminToken}`);

            expect([404, 500]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });

        it("should fail to get user without authentication (401/403)", async () => {
            const response = await request(app)
                .get(`/api/v1/admin/users/${createdDonorId}`);

            expect([401, 403]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });
    });

    // ===== UPDATE USER TESTS (3 tests) =====
    describe("6. Update User - PUT /api/v1/admin/users/:id", () => {
        it("should update user successfully with valid data (200)", async () => {
            const updateData = {
                phoneNumber: '9999999999',
                address: 'Updated Address',
                role: 'user'
            };

            const response = await request(app)
                .put(`/api/v1/admin/users/${createdDonorId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User updated successfully");
            expect(response.body.data.phoneNumber).toBe(updateData.phoneNumber);
            expect(response.body.data.address).toBe(updateData.address);
        });

        it("should fail update user without authentication (401/403)", async () => {
            const updateData = { phoneNumber: '1234567890' };

            const response = await request(app)
                .put(`/api/v1/admin/users/${createdDonorId}`)
                .send(updateData);

            expect([401, 403]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });

        it("should fail update user with invalid email format (400)", async () => {
            const updateData = { email: 'invalid-email' };

            const response = await request(app)
                .put(`/api/v1/admin/users/${createdDonorId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updateData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it("should fail update user with non-existent ID (404/500)", async () => {
            const updateData = { phoneNumber: '1234567890' };

            const response = await request(app)
                .put("/api/v1/admin/users/nonexistent-id-12345")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updateData);

            expect([404, 500]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });
    });

    // ===== DELETE USER TESTS (2 tests) =====
    describe("7. Delete User - DELETE /api/v1/admin/users/:id", () => {
        it("should delete user successfully (200)", async () => {
            const response = await request(app)
                .delete(`/api/v1/admin/users/${createdOrgId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User deleted successfully");
        });

        it("should fail delete user without authentication (401/403)", async () => {
            const response = await request(app)
                .delete(`/api/v1/admin/users/${createdDonorId}`);

            expect([401, 403]).toContain(response.status);
            expect(response.body.success).toBe(false);
        });

 
    });

    // ===== SUMMARY INFORMATION =====
    describe("Summary: Routes & Status Codes", () => {
        it("displays all admin routes and their status codes", () => {
            const routesSummary = {
                "Admin Registration": {
                    "POST /api/v1/admin/register": {
                        "Success": 201,
                        "Duplicate Email": 409,
                        "Missing Fields": 400,
                        "Invalid Email": 400
                    }
                },
                "Admin Login": {
                    "POST /api/v1/admin/login": {
                        "Success": 200,
                        "Wrong Password": 500,
                        "Non-existent Email": 500,
                        "Missing Fields": 400
                    }
                },
                "User Management": {
                    "POST /api/v1/admin/users": {
                        "Success": 201,
                        "No Authentication": 401,
                        "Duplicate Email": 409,
                        "Missing Fields": 400,
                        "Invalid Data": 400
                    },
                    "GET /api/v1/admin/users": {
                        "Success": 200,
                        "No Authentication": 401
                    },
                    "GET /api/v1/admin/users/:id": {
                        "Success": 200,
                        "Invalid ID": 404,
                        "No Authentication": 401
                    },
                    "PUT /api/v1/admin/users/:id": {
                        "Success": 200,
                        "No Authentication": 401,
                        "Invalid Data": 400,
                        "User Not Found": 404
                    },
                    "DELETE /api/v1/admin/users/:id": {
                        "Success": 200,
                        "No Authentication": 401,
                        "User Not Found": 404
                    }
                }
            };

            console.log("\n================== ADMIN ROUTES SUMMARY ==================");
            console.log(JSON.stringify(routesSummary, null, 2));
            console.log("==========================================================\n");
            expect(true).toBe(true);
        });
    });
});