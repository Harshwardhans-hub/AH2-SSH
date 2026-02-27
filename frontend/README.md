# 🎓 Hack-2-Hire - Centralized Internship & Placement Tracking Platform

A comprehensive web application for managing student placements, internships, and recruitment drives with role-based dashboards for Students, Colleges, and Admins.

![React](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-16.x-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.x-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## ✨ Features

### 🎯 Role-Based Dashboards

#### Student Dashboard
- 📊 **Placement Overview** - Track your placement journey with statistics
- 📝 **Application Tracker** - Monitor all job/internship applications
- ⭐ **AI-Powered Recommendations** - Get personalized job suggestions
- 👥 **Community System** - Join password-protected communities
- 📈 **Career Guidance** - Explore career paths and opportunities
- 📄 **Document Management** - Upload and manage resumes, certificates
- 📅 **Events Calendar** - Stay updated with placement events

#### College Dashboard
- 🏠 **Placement Overview** - Real-time placement statistics
  - Total Students, Eligible Students, Placed/Unplaced
  - Placement Percentage (auto-calculated)
  - Average & Highest Package
  - Students with Multiple Offers

- 📊 **Placement Tracking** - Detailed student placement management
  - Filter by Department, Status, CGPA, Year
  - Edit student placement data
  - Track companies applied, offers received

- 📈 **Analytics & Visualization**
  - Bar Chart: Department vs Placement %
  - Pie Chart: Placed vs Unplaced Distribution
  - Line Graph: Yearly Placement Trends
  - Department-wise Statistics Table

- 🏢 **Company Drives Management**
  - Schedule recruitment drives
  - Set eligibility criteria (CGPA, Departments)
  - View eligible students for each drive
  - Track drive status (Upcoming/Ongoing/Completed)

- 💼 **Internship Tracking**
  - Monitor student internships
  - Track PPO offers and conversions
  - View stipend and duration details
  - Update PPO conversion status

- 📋 **CAF Form Management** - Company Application Forms
- 👥 **Student Information** - View all registered students
- 🏭 **Company Information** - Manage company details

#### Admin Dashboard
- 🏠 **Admin Home** - System-wide statistics
- 🏫 **Colleges Connected** - View all registered colleges
- 👨‍🎓 **All Students** - Complete student database
- 👥 **Community Management** - Create and manage communities
- 📊 **System Analytics** - Platform-wide insights

### 🔐 Security Features
- JWT-based authentication
- Role-based access control
- Password-protected communities
- Secure API endpoints

### 🎨 UI/UX Features
- Glassmorphism design
- Dynamic backgrounds per page
- Responsive design for all devices
- Interactive charts and graphs
- Color-coded status badges
- Smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **React 18.x** - UI library
- **React Router v6** - Navigation
- **Chart.js & react-chartjs-2** - Data visualization
- **Axios** - HTTP client
- **React Icons** - Icon library
- **CSS3** - Styling with glassmorphism effects

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/AdityaMaheshYadav/Internship-placement-tracking-f1.git
cd Internship-placement-tracking-f1
```

### Install Dependencies
```bash
npm install
```

### Backend Setup
Clone and setup the backend:
```bash
git clone https://github.com/AdityaMaheshYadav/Hack-2-Hire-Backend.git
cd Hack-2-Hire-Backend/alumni-connect-backend
npm install
```

## ⚙️ Configuration

### Database Setup
1. Create PostgreSQL database:
```sql
CREATE DATABASE information;
```

2. Update backend `.env` file:
```env
DB_USER=postgres
DB_HOST=127.0.0.1
DB_NAME=information
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret_key
```

3. Run database migrations (tables are auto-created on first run)

### Frontend Configuration
Update API endpoint in `src/api.js` if needed:
```javascript
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000'
});
```

## 🚀 Usage

### Start Backend Server
```bash
cd Hack-2-Hire-Backend/alumni-connect-backend
npm run dev
```
Backend runs on: `http://127.0.0.1:8000`

### Start Frontend
```bash
cd Internship-placement-tracking-f1
npm start
```
Frontend runs on: `http://localhost:3000`

### Default Login Credentials
Create accounts through the registration page with roles:
- **Student** - For students tracking placements
- **College** - For college placement officers
- **Admin** - For system administrators

## 📁 Project Structure

```
src/
├── components/
│   ├── Login.js                    # Authentication
│   ├── StudentDashboard.js         # Student routes
│   ├── CollegeDashboard.js         # College routes
│   ├── AdminDashboard.js           # Admin routes
│   ├── PlacementTracking.js        # Placement management
│   ├── PlacementAnalytics.js       # Charts & analytics
│   ├── CompanyDrives.js            # Drive management
│   ├── InternshipTracking.js       # Internship tracking
│   ├── CommunityNew.js             # Community system
│   ├── ApplicationTracker.js       # Application tracking
│   ├── RecommendedJobs.js          # AI recommendations
│   └── ... (other components)
├── context/
│   └── BackgroundContext.js        # Dynamic backgrounds
├── App.js                          # Main app component
├── api.js                          # API configuration
└── index.js                        # Entry point
```

## 📊 Database Schema

### Main Tables
- `profile` - User accounts (students, colleges, admins)
- `student_placements` - Placement tracking data
- `company_drives` - Recruitment drives
- `internships` - Internship records
- `communities` - Community groups
- `community_posts` - Community content
- `applications` - Job applications
- `offer_letters` - Offer verification
- `events` - Placement events
- `documents` - File management

## 🎨 Key Features Showcase

### Analytics Dashboard
- Interactive charts using Chart.js
- Real-time data updates
- Year-wise filtering
- Department-wise breakdown

### Company Drives
- Create and manage drives
- Auto-filter eligible students
- Track application progress
- Update drive status

### Internship Tracking
- Monitor ongoing internships
- Track PPO offers
- Record conversions
- Calculate success rates

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
