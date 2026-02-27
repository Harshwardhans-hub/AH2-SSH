# Demo Data Information

## Overview
Demo data has been successfully added to the database for testing the College Dashboard Placement Tracking feature.

## Login Credentials

### College Admin
- **Email**: college@demo.com
- **Password**: admin123
- **Role**: College Administrator
- **College**: Demo University

### Demo Students (All passwords: student123)
1. **Rahul Sharma** - rahul@demo.com (CS, CGPA: 8.5)
2. **Priya Patel** - priya@demo.com (IT, CGPA: 9.2)
3. **Amit Kumar** - amit@demo.com (CS, CGPA: 7.8)
4. **Sneha Reddy** - sneha@demo.com (Electronics, CGPA: 8.9)
5. **Vikram Singh** - vikram@demo.com (CS, CGPA: 8.2)
6. **Anjali Gupta** - anjali@demo.com (IT, CGPA: 9.0)
7. **Rohan Verma** - rohan@demo.com (CS, CGPA: 7.5)
8. **Kavya Iyer** - kavya@demo.com (Electronics, CGPA: 8.7)
9. **Arjun Nair** - arjun@demo.com (CS, CGPA: 8.0)
10. **Divya Menon** - divya@demo.com (IT, CGPA: 9.1)

## Demo Data Statistics

### Applications
- **Total Applications**: 33 applications across 10 students
- **Companies**: Google, Microsoft, Amazon, Meta, Apple, TCS, Infosys, Wipro, Cognizant, Accenture, Goldman Sachs, Morgan Stanley, Flipkart, Paytm, Zomato
- **Application Status Distribution**:
  - Applied: ~35%
  - Shortlisted: ~20%
  - Interview: ~15%
  - Selected: ~15%
  - Rejected: ~15%

### Student Placements
- Each student has 2-5 applications
- Placement status automatically synced based on applications
- CGPA ranges from 7.5 to 9.2
- All students marked as "Eligible"

### Company Drives
- **5 Active Drives**: Google, Microsoft, Amazon, TCS, Infosys
- Drive modes: Online/Offline
- Status: Upcoming/Ongoing
- Applicant counts automatically synced from applications

## How to Test

### 1. College Dashboard - Placement Tracking
1. Login with: college@demo.com / admin123
2. Navigate to: College Dashboard → Placement Tracking
3. You will see:
   - 10 students with their placement data
   - "Applied To" column showing company names
   - "Current Status" showing Applied/Shortlisted/Interview/Placed
   - CGPA, eligibility, and other details

### 2. Student Dashboard - Applications
1. Login with any student (e.g., rahul@demo.com / student123)
2. Navigate to: Student Dashboard → Applications
3. You will see:
   - Existing applications for that student
   - Can add new applications
   - Can view/edit application details

### 3. Test Synchronization
1. Login as a student
2. Add a new application (e.g., "Netflix" as company)
3. Logout and login as college admin
4. Go to Placement Tracking
5. See the student's "Applied To" column updated with "Netflix"
6. See "Current Status" changed to "Applied"

### 4. Company Drives
1. Login as college admin
2. Navigate to: College Dashboard → Company Drives
3. See 5 company drives with applicant counts
4. Counts automatically update when students apply

### 5. Analytics & Charts
1. Login as college admin
2. Navigate to: College Dashboard → Analytics & Charts
3. See department-wise statistics
4. View placement trends and percentages

## Re-seeding Data

If you want to reset and re-add demo data:

```bash
cd backend
node seed-demo-data.js
```

This will add fresh demo data (existing data will be preserved, duplicates ignored).

## Notes

- All demo data uses "Demo University" as the college name
- Application dates are randomized within the last 30 days
- Package offers range from 5-15 LPA for selected students
- The synchronization between student applications and placement tracking is automatic
- No manual intervention needed - everything updates in real-time
