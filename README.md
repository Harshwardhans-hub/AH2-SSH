# SSH Alumni Connect - Placement Management System

A comprehensive full-stack web application for managing college placement activities, student applications, and alumni connections.

## 🌟 Features

### Student Dashboard
- **Application Tracker**: Track job and internship applications with status updates
- **Jobs & Internships**: Browse 200+ live opportunities from multiple sources
- **Resume Analyzer**: AI-powered resume analysis and suggestions
- **Career Guidance**: Personalized career recommendations
- **Community**: Connect with alumni and peers
- **Events**: Stay updated with placement drives and hackathons
- **Documents**: Access placement-related documents

### College Dashboard
- **Placement Tracking**: Real-time tracking of student placement status
- **Analytics & Charts**: Department-wise and company-wise statistics
- **Company Drives**: Manage campus recruitment drives
- **Internship Tracking**: Monitor student internships and PPO conversions
- **Student Information**: View student applications and placement details
- **Offer Letter Verification**: Verify and manage offer letters

### Key Highlights
- ✅ **Real-time Synchronization**: Student applications automatically sync to college dashboard
- ✅ **Duplicate Prevention**: Prevents duplicate applications to same company/role
- ✅ **Auto Status Updates**: Current status updates from "Not Applied" → "Applied" → "Shortlisted" → "Interview" → "Placed"
- ✅ **Live Job Scraping**: 200+ jobs from LinkedIn, Remotive, Arbeitnow, and more
- ✅ **AI Integration**: Resume analysis using Hugging Face AI
- ✅ **Event Aggregation**: Hackathons and events from Devfolio, Unstop, MLH

## 🚀 Tech Stack

### Frontend
- React.js
- React Router
- Chart.js (for analytics)
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- PostgreSQL (with pg adapter)
- JWT Authentication
- Bcrypt for password hashing
- Cron jobs for auto-sync

### External Services
- Puppeteer (web scraping)
- Hugging Face API (AI resume analysis)
- Multiple job boards APIs

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SSH-FINAL-PROTOTYPE
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
# PostgreSQL Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/alumni_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Port
PORT=8000

# Hugging Face API (optional, for resume analysis)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Email Configuration (optional)
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
COLLEGE_NAME=Your College Name
```

### 3. Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL from https://www.postgresql.org/download/

# Create database
psql -U postgres
CREATE DATABASE alumni_db;
\q

# Tables will be created automatically when you start the server
```

**Option B: Cloud PostgreSQL (Render, Supabase, Neon)**
- See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions
- Set DATABASE_URL environment variable

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

### 5. Frontend Setup

```bash
cd ../frontend
npm install
```

### 6. Add Demo Data (Optional)

```bash
cd ../backend
node seed-demo-data.js
```

## 🎯 Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

Backend will run on: http://localhost:8000

### Start Frontend Server

```bash
cd frontend
npm start
```

Frontend will run on: http://localhost:3000

## 🔑 Demo Credentials

### College Admin
- **Email**: college@demo.com
- **Password**: admin123

### Students (Password: student123)
- rahul@demo.com
- priya@demo.com
- amit@demo.com
- sneha@demo.com
- vikram@demo.com
- anjali@demo.com
- rohan@demo.com
- kavya@demo.com
- arjun@demo.com
- divya@demo.com

## 📊 Database Schema

### Main Tables
- **profile**: User accounts (students, college admins)
- **applications**: Student job/internship applications
- **student_placements**: Placement tracking data
- **company_drives**: Campus recruitment drives
- **internships**: Internship records with PPO tracking
- **offer_letters**: Offer letter verification
- **jobs**: Scraped job listings
- **events**: Hackathons and placement events
- **communities**: Alumni communities
- **documents**: Placement documents

## 🔄 Synchronization Flow

```
Student applies → ApplicationTracker
    ↓
POST /applications (with duplicate check)
    ↓
syncApplicationToPlacement() function
    ↓
Updates student_placements table:
- current_status (Not Applied → Applied → Placed)
    ↓
College Dashboard reflects changes:
- Placement Tracking (updated status)
- Applied To column (company names)
- Analytics & Charts (real-time data)
```

## 📁 Project Structure

```
SSH-FINAL-PROTOTYPE/
├── backend/
│   ├── services/
│   │   ├── jobService.js          # Job scraping logic
│   │   ├── eventScraperService.js # Event scraping
│   │   └── resumeService.js       # AI resume analysis
│   ├── server.js                  # Main server file
│   ├── seed-demo-data.js          # Demo data seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StudentDashboard.js
│   │   │   ├── CollegeDashboard.js
│   │   │   ├── ApplicationTracker.js
│   │   │   ├── PlacementTracking.js
│   │   │   ├── JobsInternshipsPage.js
│   │   │   └── ... (other components)
│   │   ├── context/
│   │   ├── App.js
│   │   └── api.js
│   └── package.json
├── README.md
└── DEMO_DATA_INFO.md
```

## 🎨 Features in Detail

### Application Tracker
- Add/Edit/View applications
- Track status: Applied, Shortlisted, Interview, Selected, Rejected
- Search and filter by company, role, status
- Success rate calculation
- Duplicate prevention

### Placement Tracking (College Dashboard)
- View all students with placement status
- Filter by department, CGPA, status, year
- See companies applied to by each student
- Real-time status updates
- Export capabilities

### Job Scraping
- LinkedIn (multiple search queries)
- Company-specific: Google, Microsoft, Amazon, Meta, Apple
- Remote jobs: Remotive, Arbeitnow
- Startup jobs
- Auto-refresh every 6 hours

### Analytics
- Department-wise placement statistics
- Company-wise hiring trends
- Yearly placement trends
- Success rate calculations
- Interactive charts (Bar, Pie, Line)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- CORS enabled
- Input validation

## 🐛 Known Issues

- Some job scraping APIs may have rate limits
- Puppeteer requires additional setup on some systems
- PostgreSQL must be running for the application to work

## 🚧 Future Enhancements

- Email notifications for placement updates
- SMS alerts for interview schedules
- Advanced analytics with ML predictions
- Mobile app (React Native)
- Integration with LinkedIn API
- Automated resume parsing
- Video interview scheduling

## 📝 API Endpoints

### Authentication
- POST `/register` - Register new user
- POST `/login` - User login

### Applications
- GET `/applications/:studentId` - Get student applications
- POST `/applications` - Create application
- PUT `/applications/:id` - Update application

### Placement Tracking
- GET `/placement/tracking/:collegeId` - Get placement data
- GET `/placement/overview/:collegeId` - Get statistics
- GET `/placement/department-stats/:collegeId` - Department stats
- POST `/placement/student` - Update student placement

### Company Drives
- GET `/company-drives/:collegeId` - Get drives
- POST `/company-drives` - Create drive
- PUT `/company-drives/:id` - Update drive

### Jobs & Events
- GET `/jobs` - Get all jobs
- GET `/events` - Get all events

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Job data from LinkedIn, Remotive, Arbeitnow
- Event data from Devfolio, Unstop, MLH
- AI powered by Hugging Face
- Icons from React Icons

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

## 🔗 Links

- [Demo Data Info](./DEMO_DATA_INFO.md)
- [API Documentation](#api-endpoints)
- [Contributing Guidelines](#contributing)

---

Made with ❤️ for college placement management
