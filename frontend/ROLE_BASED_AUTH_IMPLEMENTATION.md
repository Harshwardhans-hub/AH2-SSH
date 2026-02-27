# Role-Based Authentication Implementation

## Overview
Successfully implemented role-based authentication for the Hack-2-Hire platform supporting three roles:
- **Student**
- **College**
- **Admin**

## Changes Made

### 1. Backend Changes (server.js)

#### Database Schema Updates
- Added `role` field (VARCHAR(20), default: 'student')
- Added `department` field (VARCHAR(100)) - for College users
- Added `phone` field (VARCHAR(20)) - for College users
- Added `created_at` timestamp field

#### API Endpoints Updated

**POST /auth/register**
- Now accepts `role` parameter ('student' or 'college')
- Role-specific validation:
  - Students: require `pass_out_year`
  - College: require `department`
- Admin registration blocked from frontend (backend only)

**POST /auth/login**
- Now accepts optional `role` parameter
- Validates role matches user's registered role
- Returns role in JWT token and user object

**GET /profile/:id**
- Now returns role, department, and phone fields

### 2. Frontend Changes (Login.js)

#### New Features
- Role selection buttons (Student, College, Admin)
- Dynamic form fields based on selected role
- Role-specific validation
- Admin registration disabled from UI

#### Student Registration Fields
- Full Name
- Email
- College Name
- Pass Out Year (required)
- Password

#### College Registration Fields
- Full Name
- Email
- College/Institution Name
- Department (required)
- Phone Number (optional)
- Password

#### Login Flow
- Select role before login
- Role-specific authentication
- Role information stored in localStorage

### 3. UI/UX Updates (Login.css)

- Added role selection button group
- Responsive design maintained
- Disabled state for Admin registration
- Hover effects and active states
- Increased container width to 400px for better layout

## Database Migration

### Option 1: Update Existing Table (Recommended if you have data)
Run this SQL in pgAdmin:

```sql
ALTER TABLE profile 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student',
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE profile SET role = 'student' WHERE role IS NULL;
```

### Option 2: Fresh Start (If no important data)
1. Drop the existing table in pgAdmin:
   ```sql
   DROP TABLE IF EXISTS profile CASCADE;
   ```
2. Restart the backend server - it will auto-create the new schema

## How to Use

### For Students
1. Select "Student" role
2. Click "Create Account"
3. Fill in: Name, Email, College, Pass Out Year, Password
4. Register and login

### For College Users
1. Select "College" role
2. Click "Create Account"
3. Fill in: Name, Email, Institution Name, Department, Phone (optional), Password
4. Register and login

### For Admin Users
- Admin accounts can only be created directly in the database
- Use pgAdmin to insert admin users:
  ```sql
  INSERT INTO profile (name, email, role, password)
  VALUES ('Admin Name', 'admin@example.com', 'admin', 'hashed_password_here');
  ```
- Admins can login by selecting "Admin" role

## Security Features

1. **Role Validation**: Backend validates role on registration and login
2. **Admin Protection**: Admin registration blocked from frontend
3. **Password Hashing**: bcrypt with salt rounds
4. **JWT Tokens**: Include role information for authorization
5. **Role-specific Fields**: Only required fields shown based on role

## Testing

### Test Student Registration
1. Select "Student" role
2. Register with valid student data
3. Login as student
4. Verify role in localStorage

### Test College Registration
1. Select "College" role
2. Register with college data including department
3. Login as college
4. Verify role and department stored

### Test Admin Login
1. Create admin user in database
2. Select "Admin" role on login page
3. Login with admin credentials
4. Verify admin access

## Next Steps (Recommended)

1. **Role-Based Dashboards**: Create separate dashboard components for each role
2. **Route Protection**: Add role-based route guards in React Router
3. **Authorization Middleware**: Create backend middleware to check user roles
4. **Admin Panel**: Build admin interface for user management
5. **College Features**: Add college-specific features (post jobs, manage students)
6. **Student Features**: Add student-specific features (apply for jobs, view placements)

## Files Modified

- `SIH-project-Backend/alumni-connect-backend/server.js`
- `SIH-project/src/components/Login.js`
- `SIH-project/src/components/Login.css`

## Database

- Database Name: `information`
- Updated Table: `profile`
- New Columns: `role`, `department`, `phone`, `created_at`
