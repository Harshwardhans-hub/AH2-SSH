// seed-demo-data.js - Add demo data for placement tracking
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "alumni_db.sqlite");
const db = new sqlite3.Database(dbPath);

// Wrapper for promises
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

async function seedDemoData() {
  try {
    console.log("🌱 Starting demo data seeding...");

    // Create a demo college admin if not exists
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const collegeAdmin = await run(
      `INSERT OR IGNORE INTO profile (name, email, password, role, college, created_at) 
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      ["Demo College Admin", "college@demo.com", hashedPassword, "college", "Demo University"]
    );
    console.log("✅ College admin created");

    // Demo students data
    const students = [
      { name: "Rahul Sharma", email: "rahul@demo.com", department: "Computer Science", cgpa: 8.5, year: 2024 },
      { name: "Priya Patel", email: "priya@demo.com", department: "Information Technology", cgpa: 9.2, year: 2024 },
      { name: "Amit Kumar", email: "amit@demo.com", department: "Computer Science", cgpa: 7.8, year: 2024 },
      { name: "Sneha Reddy", email: "sneha@demo.com", department: "Electronics", cgpa: 8.9, year: 2024 },
      { name: "Vikram Singh", email: "vikram@demo.com", department: "Computer Science", cgpa: 8.2, year: 2024 },
      { name: "Anjali Gupta", email: "anjali@demo.com", department: "Information Technology", cgpa: 9.0, year: 2024 },
      { name: "Rohan Verma", email: "rohan@demo.com", department: "Computer Science", cgpa: 7.5, year: 2024 },
      { name: "Kavya Iyer", email: "kavya@demo.com", department: "Electronics", cgpa: 8.7, year: 2024 },
      { name: "Arjun Nair", email: "arjun@demo.com", department: "Computer Science", cgpa: 8.0, year: 2024 },
      { name: "Divya Menon", email: "divya@demo.com", department: "Information Technology", cgpa: 9.1, year: 2024 }
    ];

    const studentPassword = await bcrypt.hash("student123", 10);
    const studentIds = [];

    for (const student of students) {
      const result = await run(
        `INSERT OR IGNORE INTO profile (name, email, password, role, college, department, pass_out_year, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [student.name, student.email, studentPassword, "student", "Demo University", student.department, student.year]
      );
      
      // Get the student ID
      const studentRecord = await query("SELECT id FROM profile WHERE email = ?", [student.email]);
      if (studentRecord.length > 0) {
        studentIds.push({ ...student, id: studentRecord[0].id });
      }
    }
    console.log(`✅ Created ${studentIds.length} demo students`);

    // Demo companies
    const companies = [
      "Google", "Microsoft", "Amazon", "Meta", "Apple", 
      "TCS", "Infosys", "Wipro", "Cognizant", "Accenture",
      "Goldman Sachs", "Morgan Stanley", "Flipkart", "Paytm", "Zomato"
    ];

    const roles = [
      "Software Engineer", "Frontend Developer", "Backend Developer",
      "Full Stack Developer", "Data Analyst", "ML Engineer",
      "DevOps Engineer", "QA Engineer", "Product Manager"
    ];

    const locations = ["Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi", "Chennai", "Remote"];
    const statuses = ["applied", "shortlisted", "interview", "selected", "rejected"];

    // Create applications for each student
    let totalApplications = 0;
    for (const student of studentIds) {
      // Each student applies to 2-5 companies
      const numApplications = Math.floor(Math.random() * 4) + 2;
      const selectedCompanies = [];
      
      for (let i = 0; i < numApplications; i++) {
        let company;
        do {
          company = companies[Math.floor(Math.random() * companies.length)];
        } while (selectedCompanies.includes(company));
        
        selectedCompanies.push(company);
        const role = roles[Math.floor(Math.random() * roles.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        
        // Assign status based on probability
        let status;
        const rand = Math.random();
        if (rand < 0.15) status = "selected";
        else if (rand < 0.30) status = "interview";
        else if (rand < 0.50) status = "shortlisted";
        else if (rand < 0.85) status = "applied";
        else status = "rejected";

        await run(
          `INSERT INTO applications (student_id, company_name, role, location, status, applied_date) 
           VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))`,
          [student.id, company, role, location, status, Math.floor(Math.random() * 30)]
        );
        totalApplications++;
      }

      // Create student_placements record
      const apps = await query("SELECT * FROM applications WHERE student_id = ?", [student.id]);
      const selectedCount = apps.filter(a => a.status === 'selected').length;
      const interviewCount = apps.filter(a => a.status === 'interview').length;
      const shortlistedCount = apps.filter(a => a.status === 'shortlisted').length;
      
      let currentStatus = 'Not Applied';
      if (selectedCount > 0) currentStatus = 'Placed';
      else if (interviewCount > 0) currentStatus = 'Interview';
      else if (shortlistedCount > 0) currentStatus = 'Shortlisted';
      else if (apps.length > 0) currentStatus = 'Applied';

      await run(
        `INSERT OR REPLACE INTO student_placements 
         (student_id, cgpa, eligibility_status, companies_applied, current_status, 
          offer_count, package_offered, is_placed, graduation_year, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          student.id,
          student.cgpa,
          'Eligible',
          apps.length,
          currentStatus,
          selectedCount,
          selectedCount > 0 ? (Math.random() * 10 + 5).toFixed(1) : null,
          selectedCount > 0 ? 1 : 0,
          student.year
        ]
      );
    }
    console.log(`✅ Created ${totalApplications} demo applications`);

    // Create some company drives
    const driveCompanies = ["Google", "Microsoft", "Amazon", "TCS", "Infosys"];
    for (const company of driveCompanies) {
      const applicants = await query(
        "SELECT COUNT(DISTINCT student_id) as count FROM applications WHERE company_name = ?",
        [company]
      );
      
      await run(
        `INSERT OR IGNORE INTO company_drives 
         (company_name, job_role, package_offered, drive_date, drive_mode, 
          eligibility_criteria, students_applied, drive_status, college_id, created_at) 
         VALUES (?, ?, ?, date('now', '+' || ? || ' days'), ?, ?, ?, ?, ?, datetime('now'))`,
        [
          company,
          "Software Engineer",
          (Math.random() * 15 + 5).toFixed(1),
          Math.floor(Math.random() * 60),
          Math.random() > 0.5 ? "Online" : "Offline",
          "CGPA: 7.0+, Departments: Computer Science, IT",
          applicants[0]?.count || 0,
          Math.random() > 0.5 ? "Upcoming" : "Ongoing",
          1
        ]
      );
    }
    console.log(`✅ Created ${driveCompanies.length} company drives`);

    console.log("\n🎉 Demo data seeding completed successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("College Admin: college@demo.com / admin123");
    console.log("Students: rahul@demo.com, priya@demo.com, etc. / student123");
    
    db.close();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    db.close();
  }
}

seedDemoData();
