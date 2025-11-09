# 🏥 ReferHarmony

**Bridging Care with Clarity and Precision**

A comprehensive Referral & Care Navigation System designed to streamline patient referrals, reduce coordination delays, and ensure continuous, connected care across healthcare providers—especially in rural areas like Joplin.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Expected Outcomes](#expected-outcomes)
- [Future Enhancements](#future-enhancements)
- [Security & HIPAA Compliance](#security--hipaa-compliance)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

ReferHarmony addresses critical problems in healthcare referral coordination:

- **Referral Gaps** – Patients getting lost between providers
- **Delays** – Coordination failures slowing treatment
- **Disconnection** – Information not following patients
- **Poor Outcomes** – Fragmented care harming patient health

---

## ✨ Core Features

### 1. Automated Referral Workflow
- Send, receive, and confirm referrals between providers automatically
- Real-time status tracking with detailed timeline
- Automated notifications via email and SMS

### 2. Real-Time Tracking Dashboard
- Monitor referral status, provider response time, and next steps
- Visual timeline of referral progress
- Filter by status, urgency, and specialty

### 3. Patient Portal & Notifications
- Patients receive SMS/email reminders for appointments
- Real-time referral updates
- Secure access to referral information

### 4. Smart Matching Engine
- AI-based matching between patients and specialists
- Considers insurance, location, and availability
- Calculates match scores for optimal provider selection

### 5. Data Integration Ready
- Built to connect with EHR systems (Epic, Cerner)
- HL7/FHIR standards support
- RESTful API architecture

### 6. Leakage Analytics
- Visualize where referrals drop off
- Track response times and completion rates
- Improve retention with data-driven insights

### 7. Care Team Chat
- Secure real-time messaging via Socket.io
- Discuss patient transitions
- HIPAA-compliant communication

---

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Twilio** for SMS notifications
- **Helmet** & rate limiting for security

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **React Icons** for UI icons
- **React Toastify** for notifications

### Database
- **MongoDB** - NoSQL database for flexible schema

### Security
- HIPAA-compliant authentication (JWT, bcrypt)
- Helmet for HTTP headers security
- Rate limiting to prevent abuse
- CORS configuration
- Data encryption in transit and at rest

---

## 📁 Project Structure

```
ReferHarmony/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context (Auth)
│   │   ├── pages/            # Page components
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── config/
│   └── database.js           # MongoDB connection
├── middleware/
│   └── auth.js               # Authentication middleware
├── models/
│   ├── User.js               # User schema
│   ├── Referral.js           # Referral schema
│   └── Message.js            # Message schema
├── routes/
│   ├── auth.js               # Authentication routes
│   └── referrals.js          # Referral routes
├── services/
│   └── notificationService.js # Email/SMS service
├── .env.example              # Environment variables template
├── package.json
├── server.js                 # Express server
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ReferHarmony
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/referharmony

# JWT
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=24h

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=ReferHarmony <noreply@referharmony.com>

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
CLIENT_URL=http://localhost:3000

# FHIR (Optional - for EHR integration)
FHIR_BASE_URL=https://fhir.epic.com/api/FHIR/R4
FHIR_CLIENT_ID=your_client_id
FHIR_CLIENT_SECRET=your_client_secret

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on http://localhost:3000

### Production Mode

**Build Frontend:**
```bash
cd client
npm run build
```

**Start Backend:**
```bash
npm start
```

### Run Both Concurrently (Backend only)
```bash
npm run dev:full
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient|provider|admin",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "phone": "+1987654321"
}
```

### Referral Endpoints

#### Create Referral (Provider/Admin only)
```http
POST /api/referrals
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "user_id",
  "receivingProviderId": "provider_id",
  "specialty": "Cardiology",
  "reasonForReferral": "Chest pain evaluation",
  "clinicalNotes": "Patient reports...",
  "urgency": "routine|urgent|emergency",
  "patientInsurance": {
    "provider": "Blue Cross",
    "memberId": "123456"
  }
}
```

#### Get All Referrals
```http
GET /api/referrals?status=pending&urgency=urgent
Authorization: Bearer <token>
```

#### Get Single Referral
```http
GET /api/referrals/:id
Authorization: Bearer <token>
```

#### Update Referral Status (Provider/Admin only)
```http
PUT /api/referrals/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "acknowledged|scheduled|completed|cancelled|rejected",
  "note": "Appointment scheduled",
  "appointmentDate": "2024-01-15T10:00:00Z",
  "appointmentLocation": "Main Clinic, Room 204"
}
```

#### Get Analytics (Provider/Admin only)
```http
GET /api/referrals/analytics/overview?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

---

## 👥 User Roles

### Patient
- View personal referrals
- Track referral status
- Receive notifications
- Access referral details

### Provider
- Create referrals
- View sent and received referrals
- Update referral status
- Schedule appointments
- Access analytics
- Chat with care team

### Admin
- Full system access
- Manage all users
- View all referrals
- System analytics
- User management

---

## 📊 Expected Outcomes

- **40-60% reduction** in referral delays
- **25% improvement** in patient retention and satisfaction
- Stronger provider collaboration
- Reduced administrative workload
- Better care coordination in rural areas

---

## 🔮 Future Enhancements

### Phase 2
- Enhanced analytics dashboard
- EHR integration (Epic, Cerner)
- Advanced filtering and search
- Bulk operations
- Export functionality

### Phase 3
- AI-based referral routing
- Predictive insights
- Machine learning for match optimization
- Advanced leakage analysis
- Automated appointment scheduling

### Additional Features
- Mobile applications (iOS/Android)
- Telemedicine integration
- Patient satisfaction surveys
- Provider rating system
- Multi-language support
- Accessibility improvements (WCAG compliance)

---

## 🔒 Security & HIPAA Compliance

### Implemented Security Measures

1. **Authentication & Authorization**
   - JWT-based authentication
   - Password hashing with bcrypt (12 rounds)
   - Role-based access control
   - Session management

2. **Data Protection**
   - HTTPS/TLS encryption in transit
   - Encrypted data at rest
   - Secure password requirements
   - Input validation and sanitization

3. **API Security**
   - Helmet.js for HTTP headers
   - Rate limiting (100 requests per 15 min)
   - CORS configuration
   - Request logging

4. **HIPAA Considerations**
   - Access controls
   - Audit logging
   - Data encryption
   - Secure messaging
   - User authentication

### Production Recommendations

- Use HTTPS certificates (Let's Encrypt)
- Enable MongoDB authentication
- Use environment-specific secrets
- Implement backup strategies
- Set up monitoring and alerts
- Conduct security audits
- Implement business associate agreements
- Use VPN for database access
- Enable database encryption

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Contact & Support

For questions, feedback, or support:

- **Email**: support@referharmony.com
- **Documentation**: [Full documentation coming soon]
- **Issues**: Please use GitHub Issues for bug reports

---

## 🙏 Acknowledgments

Built to address healthcare coordination challenges in rural communities, with a focus on improving patient outcomes through technology.

**ReferHarmony** - *Bridging Care with Clarity and Precision*

---

## 🎨 Design Guidelines

**Colors:**
- Primary Blue: `#007bff` (Trust, Healthcare)
- Success Green: `#4caf50` (Health, Growth)
- White/Gray: Modern simplicity

**Style:**
- Friendly and professional
- Easy to navigate
- Accessible design
- Mobile-responsive

---

**Version:** 1.0.0 (MVP)  
**Last Updated:** November 2025

