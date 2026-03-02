# Raktosewa Backend API

A RESTful backend for the **Raktosewa** blood donation platform, built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

---

## Tech Stack

- Runtime: Node.js + TypeScript
- Framework: Express.js
- Database: MongoDB (Mongoose)
- Auth: JWT
- File Storage: Multer (local `public/` directory)
- Testing: Jest

---

## Getting Started

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/raktosewa
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

## Base URL

```
http://localhost:5000/api/v1
```

---

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login user | Public |

---

### Donor — `/api/v1/donor`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/donor/register` | Register a new donor | Public |
| POST | `/donor/login` | Donor login | Public |
| POST | `/donor/forgot-password` | Send OTP for password reset | Public |
| POST | `/donor/verify-otp` | Verify OTP | Public |
| POST | `/donor/reset-password` | Reset password with OTP | Public |
| POST | `/donor/resend-otp` | Resend OTP | Public |
| GET | `/donor/` | Get all donors | Public |
| GET | `/donor/:id` | Get donor by ID | Public |
| PUT | `/donor/:id` | Update donor profile | Public |
| POST | `/donor/upload-photo` | Upload profile picture | DONOR |

---

### Organization — `/api/v1/organization`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/organization/register` | Register a new organization | Public |
| POST | `/organization/login` | Organization login | Public |
| POST | `/organization/forgot-password` | Send OTP for password reset | Public |
| POST | `/organization/verify-otp` | Verify OTP | Public |
| POST | `/organization/reset-password` | Reset password with OTP | Public |
| POST | `/organization/resend-otp` | Resend OTP | Public |
| GET | `/organization/` | Get all organizations | Public |
| GET | `/organization/:id` | Get organization by ID | Public |
| GET | `/organization/dashboard/stats` | Get dashboard statistics | ORGANIZATION |
| PUT | `/organization/:id` | Update organization profile | Public |
| POST | `/organization/upload-photo` | Upload profile picture | ORGANIZATION |

---

### Blood Inventory — `/api/v1/inventory`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/inventory/all-stock` | Get all blood stock | DONOR / ADMIN |
| GET | `/inventory/` | Get my organization's inventory | ORGANIZATION |
| POST | `/inventory/update` | Update blood inventory | ORGANIZATION |
| DELETE | `/inventory/:bloodGroup` | Delete inventory entry | ORGANIZATION |

---

### Campaigns — `/api/v1/campaigns`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/campaigns/` | Get all campaigns | Public |
| POST | `/campaigns/` | Create a campaign | ORGANIZATION |
| GET | `/campaigns/my-campaigns` | Get campaigns by my organization | ORGANIZATION |
| GET | `/campaigns/my-applied` | Get campaigns I applied to | DONOR |
| GET | `/campaigns/by-month` | Get campaigns by month (calendar) | Any |
| GET | `/campaigns/:id` | Get single campaign | Any |
| PUT | `/campaigns/:id` | Update campaign | ORGANIZATION |
| DELETE | `/campaigns/:id` | Delete campaign | ORGANIZATION |
| POST | `/campaigns/:id/apply` | Apply for a campaign | DONOR |
| GET | `/campaigns/:id/participants` | Get campaign participants | ORGANIZATION |
| DELETE | `/campaigns/:id/applicants/:applicantId` | Remove applicant | ORGANIZATION |

---

### Blood Requests — `/api/v1/requests`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/requests/` | Get all blood requests | DONOR / ADMIN |
| POST | `/requests/` | Create a blood request | ORGANIZATION |
| GET | `/requests/my-requests` | Get my organization's requests | ORGANIZATION |
| GET | `/requests/my-accepted` | Get requests I accepted | DONOR |
| GET | `/requests/:id` | Get request by ID | Any |
| PUT | `/requests/:id` | Update request | ORGANIZATION |
| DELETE | `/requests/:id` | Delete request | ORGANIZATION |
| POST | `/requests/:id/accept` | Accept a blood request | DONOR |
| GET | `/requests/:id/applicants` | Get request applicants | ORGANIZATION |
| DELETE | `/requests/:id/applicants/:applicantId` | Remove applicant | ORGANIZATION |

---

### Donations — `/api/v1/donations`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/donations/walkin` | Register a walk-in donation | ORGANIZATION |
| POST | `/donations/register` | Register a donation by registered donor | ORGANIZATION |
| GET | `/donations/history` | Get donation history | Any |

---

### Notifications — `/api/v1/notifications`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications/` | Get my notifications | Any |

---

### Admin — `/api/v1/admin`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/admin/register` | Register admin | Public |
| POST | `/admin/login` | Admin login | Public |
| GET | `/admin/me` | Get admin profile | ADMIN |
| PUT | `/admin/change-password` | Change admin password | ADMIN |
| GET | `/admin/stats/dashboard` | Get platform dashboard stats | ADMIN |
| POST | `/admin/users` | Create a user | ADMIN |
| GET | `/admin/users` | Get all users | ADMIN |
| GET | `/admin/users/:id` | Get user by ID | ADMIN |
| PUT | `/admin/users/:id` | Update user | ADMIN |
| DELETE | `/admin/users/:id` | Delete user | ADMIN |
| POST | `/admin/campaigns` | Create a campaign | ADMIN |
| GET | `/admin/campaigns` | Get all campaigns | ADMIN |
| GET | `/admin/campaigns/:id` | Get campaign by ID | ADMIN |
| PUT | `/admin/campaigns/:id` | Update campaign | ADMIN |
| DELETE | `/admin/campaigns/:id` | Delete campaign | ADMIN |

---

## Project Structure

```
src/
├── app.ts                  # Express app setup
├── index.ts                # Server entry point
├── config/
│   └── db.ts               # DB config
├── database/
│   └── mongodb.ts          # MongoDB connection
├── controllers/            # Route handlers
│   └── admin/
├── services/               # Business logic
│   └── admin/
├── repositories/           # DB query layer
├── models/                 # Mongoose schemas
├── routes/                 # Express routers
│   └── admin/
├── middlewares/            # Auth, upload, authorization
├── dtos/                   # Data transfer objects
├── seeders/                # DB seed scripts
├── utils/                  # Email, OTP helpers
└── __tests__/              # Unit & integration tests
```

---

## Roles

| Role | Description |
|------|-------------|
| `DONOR` | Individual blood donor |
| `ORGANIZATION` | Blood bank / hospital / NGO |
| `ADMIN` | Platform administrator |

---

## License

MIT
