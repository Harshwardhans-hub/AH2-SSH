// server.js
// Scraper integrated
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const multer = require("multer");
const { fetchAllJobs } = require("./services/jobService");
const { fetchAllEvents } = require("./services/eventScraperService");
const { extractTextFromPDF, analyzeResumeWithAI } = require("./services/resumeService");
const { Pool } = require("pg");

const app = express();
const PORT = 8000;

// Multer setup for in-memory file uploads
const upload = multer({ storage: multer.memoryStorage() });

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// SQLite database
const dbPath = path.join(__dirname, "alumni_db.sqlite");
const db = new sqlite3.Database(dbPath);

// Wrapper to mimic pg pool.query
const pool = {
  query: (text, params) => {
    return new Promise((resolve, reject) => {
      // Convert $1, $2, etc to ? for SQLite
      const sql = text.replace(/\$\d+/g, "?");

      if (sql.trim().toUpperCase().startsWith("SELECT")) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        db.run(sql, params, function (err) {
          if (err) reject(err);
          else {
            // If it's an INSERT with RETURNING, we might need a follow up or just return the id
            // For this project, we'll try to handle the RETURNING part by querying if needed, 
            // but let's see if we can simplify.
            resolve({ rows: [{ id: this.lastID }], lastID: this.lastID });
          }
        });
      }
    });
  },
};


// Middleware
app.use(cors()); // Allow all for local development to avoid network errors
app.use(express.json());

// JWT secret
const JWT_SECRET = "supersecretkey";

// ===== CREATE TABLES IF NOT EXISTS =====
(async () => {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        college VARCHAR(100),
        pass_out_year INT,
        department VARCHAR(100),
        phone VARCHAR(20),
        password VARCHAR(255),
        login_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Profile table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'General',
        password VARCHAR(255),
        cover_image VARCHAR(500),
        created_by INT REFERENCES profile(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Communities table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS community_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        community_id INT REFERENCES communities(id),
        user_id INT REFERENCES profile(id),
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(community_id, user_id)
      )`
    );
    console.log("✅ Community Members table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS community_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        community_id INT REFERENCES communities(id),
        user_id INT REFERENCES profile(id),
        content TEXT NOT NULL,
        post_type VARCHAR(50) DEFAULT 'post',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Community Posts table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        company TEXT,
        location TEXT,
        salary TEXT,
        type TEXT,
        source TEXT,
        applyLink TEXT UNIQUE,
        postedDate TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Jobs table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        organizer TEXT,
        date TEXT,
        endDate TEXT,
        description TEXT,
        link TEXT UNIQUE,
        location TEXT,
        type TEXT,
        source TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Events table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS caf_forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_id INT REFERENCES profile(id),
        company_name VARCHAR(200) NOT NULL,
        company_email VARCHAR(100),
        company_phone VARCHAR(20),
        job_role VARCHAR(200),
        job_description TEXT,
        eligibility_criteria TEXT,
        salary_package VARCHAR(100),
        application_deadline DATE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ CAF Forms table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        website VARCHAR(200),
        industry VARCHAR(100),
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Companies table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        file_url VARCHAR(500),
        uploaded_by INT REFERENCES profile(id),
        document_type VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Documents table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INT REFERENCES profile(id),
        company_name VARCHAR(200) NOT NULL,
        role VARCHAR(200) NOT NULL,
        applied_date DATE DEFAULT (date('now')),
        status VARCHAR(50) DEFAULT 'applied',
        location VARCHAR(200),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Applications table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS student_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INT REFERENCES profile(id) UNIQUE,
        resume_uploaded BOOLEAN DEFAULT 0,
        resume_url VARCHAR(500),
        skills TEXT,
        course VARCHAR(100),
        profile_completion INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Student Profiles table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS placement_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_type VARCHAR(50),
        event_date DATE,
        event_time TIME,
        location VARCHAR(200),
        is_online BOOLEAN DEFAULT 0,
        organizer_id INT REFERENCES profile(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Placement Events table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INT REFERENCES profile(id),
        title VARCHAR(200) NOT NULL,
        message TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Notifications table ready");

    // Placement Tracking Tables
    await pool.query(
      `CREATE TABLE IF NOT EXISTS student_placements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INT UNIQUE REFERENCES profile(id),
        cgpa DECIMAL(3,2),
        eligibility_status VARCHAR(50) DEFAULT 'Eligible',
        companies_applied INT DEFAULT 0,
        current_status VARCHAR(50) DEFAULT 'Not Applied',
        offer_count INT DEFAULT 0,
        package_offered DECIMAL(10,2),
        graduation_year INT,
        is_placed BOOLEAN DEFAULT 0,
        placement_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Student Placements table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS company_drives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name VARCHAR(200) NOT NULL,
        job_role VARCHAR(200),
        package_offered DECIMAL(10,2),
        drive_date DATE,
        drive_mode VARCHAR(50) DEFAULT 'Online',
        eligibility_criteria TEXT,
        students_applied INT DEFAULT 0,
        students_shortlisted INT DEFAULT 0,
        students_selected INT DEFAULT 0,
        drive_status VARCHAR(50) DEFAULT 'Upcoming',
        college_id INT REFERENCES profile(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Company Drives table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS offer_letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INT REFERENCES profile(id),
        company_name VARCHAR(200) NOT NULL,
        offer_type VARCHAR(50) DEFAULT 'Full-time',
        package_amount DECIMAL(10,2),
        file_url TEXT,
        verification_status VARCHAR(50) DEFAULT 'Pending',
        verified_by INT REFERENCES profile(id),
        verification_date DATETIME,
        rejection_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Offer Letters table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INT REFERENCES profile(id),
        company_name VARCHAR(200) NOT NULL,
        stipend DECIMAL(10,2),
        start_date DATE,
        end_date DATE,
        has_ppo BOOLEAN DEFAULT 0,
        ppo_converted BOOLEAN DEFAULT 0,
        ppo_package DECIMAL(10,2),
        internship_status VARCHAR(50) DEFAULT 'Ongoing',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✅ Internships table ready");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS drive_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drive_id INT REFERENCES company_drives(id),
        student_id INT REFERENCES profile(id),
        application_status VARCHAR(50) DEFAULT 'Applied',
        interview_date DATETIME,
        is_selected BOOLEAN DEFAULT 0,
        offer_package DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(drive_id, student_id)
      )`
    );
    console.log("✅ Drive Applications table ready");

  } catch (err) {
    console.error("❌ Error creating tables:", err);
  }
})();

// ===== JOB SYNC LOGIC =====
async function syncJobs() {
  console.log("🔄 Syncing jobs from external APIs...");
  const jobs = await fetchAllJobs();
  let count = 0;
  for (const job of jobs) {
    try {
      await pool.query(
        `INSERT INTO jobs (title, company, location, salary, type, source, applyLink, postedDate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT(applyLink) DO NOTHING`,
        [job.title, job.company, job.location, job.salary, job.type, job.source, job.applyLink, job.postedDate]
      );
      count++;
    } catch (err) {
      // Ignore duplicates
    }
  }
  console.log(`✅ Job sync complete. Added/Updated ${count} jobs.`);
}

// ===== EVENT SYNC LOGIC =====
async function syncEvents() {
  console.log("🔄 Syncing events from scraped sources...");
  try {
    const events = await fetchAllEvents();
    let count = 0;
    for (const event of events) {
      try {
        await pool.query(
          `INSERT INTO events (title, organizer, date, endDate, description, link, location, type, source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT(link) DO NOTHING`,
          [event.title, event.organizer, event.date, event.endDate, event.description, event.link, event.location, event.type, event.source]
        );
        count++;
      } catch (err) {
        // Ignore duplicates
      }
    }
    console.log(`✅ Event sync complete. Added/Updated ${count} events.`);
  } catch (err) {
    console.error("❌ Event sync error:", err.message);
  }
}

// Cron jobs: Sync every 30 minutes
cron.schedule("*/30 * * * *", syncJobs);
cron.schedule("*/30 * * * *", syncEvents);
// Run once on startup after 5 seconds
setTimeout(syncJobs, 5000);
setTimeout(syncEvents, 8000);

// ===== JOB ROUTES =====
app.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM jobs ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch jobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// ===== EVENT ROUTES =====
app.get("/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ===== REGISTER =====
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, college, pass_out_year, password, role, department, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate role
    const validRoles = ['student', 'college', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    // Role-specific validation
    if (role === 'student' && !pass_out_year) {
      return res.status(400).json({ error: "Pass out year is required for students" });
    }

    if (role === 'college' && !department) {
      return res.status(400).json({ error: "Department is required for college users" });
    }

    const existingUser = await pool.query("SELECT * FROM profile WHERE email=$1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO profile (name, email, role, college, pass_out_year, department, phone, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, email, role, college || null, pass_out_year || null, department || null, phone || null, hashedPassword]
    );

    const newUser = { id: result.rows[0].id, name, email, role, college, pass_out_year, department, phone };
    res.json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

// ===== LOGIN =====
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    const userResult = await pool.query("SELECT * FROM profile WHERE email=$1", [email]);
    const user = userResult.rows[0];
    if (!user) return res.status(400).json({ error: "User not found" });

    // Verify role matches if provided
    if (role && user.role !== role) {
      return res.status(400).json({ error: `Invalid credentials for ${role} login` });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    // Increment login count
    await pool.query("UPDATE profile SET login_count = COALESCE(login_count, 0) + 1 WHERE id=$1", [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        pass_out_year: user.pass_out_year,
        department: user.department,
        phone: user.phone,
        login_count: (user.login_count || 0) + 1,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

// ===== FETCH PROFILE =====
app.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT id, name, email, role, college, pass_out_year, department, phone FROM profile WHERE id=$1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Profile not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch profile" });
  }
});

// ===== COMMUNITIES =====
// Get all communities
app.get("/communities", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM communities ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch communities error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch communities" });
  }
});

// Create a new community
app.post("/communities", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Community name is required" });

    const existing = await pool.query("SELECT * FROM communities WHERE name=$1", [name]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Community already exists" });

    const result = await pool.query(
      "INSERT INTO communities (name, description) VALUES ($1, $2)",
      [name, description || ""]
    );
    res.json({ id: result.rows[0].id, name, description: description || "" });
  } catch (err) {
    console.error("Create community error:", err);
    res.status(500).json({ error: err.message || "Failed to create community" });
  }
});

// ===== JOBS (additional routes) =====

// Manual sync trigger
app.post("/jobs/sync", async (req, res) => {
  try {
    await syncJobs();
    res.json({ message: "Job sync triggered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Manual sync failed" });
  }
});

// ===== RESUME ANALYZER =====
app.post("/resume/analyze", upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file || !jobDescription) {
      return res.status(400).json({ error: "Resume file and jobDescription are required." });
    }

    const { buffer, originalname } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    let resumeText = "";

    if (ext === 'pdf') {
      resumeText = await extractTextFromPDF(buffer);
    } else if (ext === 'docx') {
      resumeText = await require('./services/resumeService').extractTextFromDOCX(buffer);
    } else if (ext === 'txt') {
      resumeText = buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: "Only PDF, DOCX, and TXT files are supported." });
    }


    // Call Hugging Face API
    const aiResult = await analyzeResumeWithAI(resumeText, jobDescription);

    res.json(aiResult);
  } catch (err) {
    console.error("Resume analysis error:", err.message);
    res.status(500).json({ error: err.message || "Analysis failed" });
  }
});

// ===== CAREER SUGGEST FINDER =====
app.post("/career/suggest", async (req, res) => {
  try {
    const { skills, interests } = req.body;
    const text = (skills + " " + interests).toLowerCase();

    const careerMap = [
      { keywords: ["ai", "machine learning", "ml", "deep learning", "neural", "tensorflow", "pytorch", "nlp", "computer vision"], title: "AI/ML Engineer", desc: "Build intelligent systems using AI and machine learning.", tags: ["Python", "TensorFlow", "PyTorch", "Deep Learning"] },
      { keywords: ["data", "analytics", "statistics", "pandas", "numpy", "visualization", "tableau", "power bi"], title: "Data Scientist", desc: "Analyze complex data to help organizations make informed decisions.", tags: ["Python", "SQL", "Statistics", "Pandas"] },
      { keywords: ["cyber", "security", "hacking", "ethical", "penetration", "firewall", "soc", "siem"], title: "Cybersecurity Analyst", desc: "Protect systems and data from cyber threats.", tags: ["Network Security", "Ethical Hacking", "SIEM"] },
      { keywords: ["cloud", "aws", "azure", "gcp", "infrastructure", "terraform", "serverless"], title: "Cloud Architect", desc: "Design scalable cloud infrastructure solutions.", tags: ["AWS", "Azure", "GCP", "Terraform"] },
      { keywords: ["devops", "docker", "kubernetes", "ci/cd", "jenkins", "pipeline", "ansible", "automation"], title: "DevOps Engineer", desc: "Bridge development and operations with automation.", tags: ["Docker", "Kubernetes", "CI/CD", "Linux"] },
      { keywords: ["mobile", "android", "ios", "flutter", "react native", "swift", "kotlin", "app"], title: "Mobile App Developer", desc: "Build mobile applications for iOS and Android.", tags: ["React Native", "Flutter", "Swift", "Kotlin"] },
      { keywords: ["blockchain", "solidity", "web3", "smart contract", "defi", "crypto", "ethereum"], title: "Blockchain Developer", desc: "Build decentralized applications and smart contracts.", tags: ["Solidity", "Ethereum", "Web3.js"] },
      { keywords: ["game", "unity", "unreal", "3d", "animation", "gaming"], title: "Game Developer", desc: "Create interactive games for various platforms.", tags: ["Unity", "Unreal Engine", "C#", "C++"] },
      { keywords: ["design", "ui", "ux", "figma", "adobe", "wireframe", "prototype", "user experience", "graphic"], title: "UI/UX Designer", desc: "Design intuitive user interfaces and experiences.", tags: ["Figma", "Adobe XD", "Prototyping"] },
      { keywords: ["product", "manage", "agile", "scrum", "roadmap", "stakeholder", "strategy"], title: "Product Manager", desc: "Oversee product development, strategy, and execution.", tags: ["Agile", "Strategy", "Leadership"] },
      { keywords: ["fullstack", "full stack", "full-stack", "mern", "mean", "frontend", "backend", "front end", "back end"], title: "Full Stack Developer", desc: "Master both frontend and backend development.", tags: ["React", "Node.js", "MongoDB", "PostgreSQL"] },
      { keywords: ["javascript", "react", "node", "web", "html", "css", "vue", "angular", "typescript"], title: "Software Developer", desc: "Build applications using modern web technologies.", tags: ["JavaScript", "React", "Node.js"] },
      { keywords: ["java", "spring", "enterprise", "microservice"], title: "Software Developer", desc: "Build enterprise-grade applications.", tags: ["Java", "Spring Boot", "Microservices"] },
      { keywords: ["python", "django", "flask", "automation", "scripting"], title: "Software Developer", desc: "Build applications and automation with Python.", tags: ["Python", "Django", "Flask"] },
    ];

    let match = careerMap.find(c => c.keywords.some(k => text.includes(k)));
    if (!match) match = { title: "Software Developer", desc: "Build applications and software solutions using modern technologies.", tags: ["JavaScript", "React", "Node.js"] };

    res.json({ title: match.title, description: match.desc, tags: match.tags });
  } catch (err) {
    res.status(500).json({ error: "Could not generate guidance." });
  }
});

// ===== AI CHATBOT =====
app.post("/chatbot/ask", async (req, res) => {
  try {
    const { message, role, userId } = req.body;
    const query = (message || "").toLowerCase().trim();
    let reply = "";

    // Helper: check if query matches any keyword from a list
    const has = (...words) => words.some(w => query.includes(w));
    const hasAll = (...words) => words.every(w => query.includes(w));

    // Fetch user profile once if userId exists
    let userProfile = null;
    if (userId) {
      try {
        const pr = await pool.query("SELECT name, email, college, role, pass_out_year, department, phone, login_count FROM profile WHERE id=$1", [userId]);
        userProfile = pr.rows[0] || null;
      } catch (e) { }
    }
    const userName = userProfile?.name || "there";

    // ===== GREETING =====
    if (has("hello", "hi ", "hey", "good morning", "good afternoon", "good evening", "sup", "howdy", "greetings") && query.length < 40) {
      const greetings = [
        `Hello ${role === "college" ? "Professor" : userName}! 👋`,
        `Hey ${role === "college" ? "" : userName}! 👋 Great to see you!`,
        `Hi ${role === "college" ? "there" : userName}! 😊`,
      ];
      reply = `${greetings[Math.floor(Math.random() * greetings.length)]} How can I help you today?\n\nYou can ask me about:\n• 💼 Jobs & Internships\n• 📅 Events & Hackathons\n• 🗺️ Career Roadmaps\n• 📄 Resume Tips & Templates\n• 👤 Your Profile\n${role === "college" ? "• 📊 Student Statistics\n• 📝 CAF Forms" : "• 🎯 Interview Prep\n• 💰 Salary Info"}\n\nOr use the quick action buttons above!`;
    }

    // ===== SYSTEM / PLATFORM INFO =====
    else if (has("how") && has("system", "work", "platform", "use", "navigate")) {
      if (role === "college") {
        reply = `**Welcome to the Hack-2-Hire College Dashboard!** 🏫\n\nHere's what you can do:\n\n• **Student Information** — View all registered students, their login count, and details\n• **CAF Forms** — Create and manage Company Application Forms for placements\n• **Company Info** — Browse and manage company records\n• **Events** — Browse real-time hackathons & tech events from Devfolio, Unstop, and more\n• **Community** — Create college-specific communities for discussions\n• **Profile** — Update your college/department information\n\nThe system syncs jobs and events from 11+ sources every 30 minutes automatically.`;
      } else {
        reply = `**Welcome to Hack-2-Hire!** 🚀\n\nHere's everything you can do:\n\n• **Find Jobs** — Live job listings from LinkedIn, Google, Microsoft, Amazon, and more\n• **Career Roadmaps** — 50+ career paths with step-by-step guidance\n• **Resume Analyzer** — Upload your resume and get an AI-powered ATS score\n• **Events** — Live hackathons & competitions from Devfolio, Unstop, Devpost\n• **Community** — Connect with students from your college\n• **Applications** — Track your job applications in one place\n• **Resume Download** — Download professional resume templates\n\nAll job and event data is updated every 30 minutes!`;
      }
    }

    // ===== WHAT CAN YOU DO / HELP =====
    else if (has("what can you", "help me", "what do you", "features", "what all", "capabilities") || (query === "help")) {
      if (role === "college") {
        reply = `🎯 **I can help you with:**\n\n• **"Show student stats"** — View registered student count & platform data\n• **"Job listings"** — See current job postings in the system\n• **"Events"** — Browse upcoming hackathons & competitions\n• **"CAF form"** — Learn about Company Application Forms\n• **"How does the system work?"** — Full platform overview\n• **"My profile"** — View your account details\n• **"Placement stats"** — View placement analytics\n\nJust type your question or use the quick actions above!`;
      } else {
        reply = `🎯 **I can help you with:**\n\n• **"Show me jobs"** — Latest job openings\n• **"Internships"** — Find internship opportunities\n• **"Download resume template"** — Professional templates\n• **"Resume tips"** — ATS optimization advice\n• **"Career roadmap"** — Explore 50+ career paths\n• **"Interview tips"** — Ace your next interview\n• **"Salary expectations"** — Know your worth\n• **"My profile"** — View your account info\n• **"Upcoming hackathons"** — Live events\n\nJust type naturally — I understand most questions! 😊`;
      }
    }

    // ===== JOBS =====
    else if (has("job", "opening", "hiring", "vacancy", "vacancies", "recruit", "position") && !has("intern")) {
      try {
        const jobResult = await pool.query("SELECT COUNT(*) as total FROM jobs");
        const recentJobs = await pool.query("SELECT title, company, location FROM jobs ORDER BY id DESC LIMIT 5");
        const total = jobResult.rows[0]?.total || 0;
        let jobList = recentJobs.rows.map((j, i) => `${i + 1}. **${j.title}** at ${j.company} (${j.location || "Remote"})`).join("\n");

        if (role === "college") {
          reply = `📊 **Job Market Overview:**\n\nThere are currently **${total} active job listings** in the system from companies like Google, Microsoft, Amazon, Meta, and more.\n\n**Latest Postings:**\n${jobList}\n\nEncourage your students to check the **Jobs** section regularly!`;
        } else {
          reply = `💼 **Latest Job Openings:**\n\nWe have **${total} live positions** from LinkedIn, Remotive, Arbeitnow, and company career pages.\n\n**Recent Openings:**\n${jobList}\n\n👉 Visit **Jobs & Internships** in the sidebar to search, filter, and apply directly!`;
        }
      } catch (e) {
        reply = "💼 Check the **Jobs & Internships** section for the latest opportunities!";
      }
    }

    // ===== INTERNSHIPS =====
    else if (has("intern", "internship", "trainee", "apprentice")) {
      try {
        const jobResult = await pool.query("SELECT COUNT(*) as total FROM jobs WHERE LOWER(title) LIKE '%intern%' OR LOWER(type) LIKE '%intern%'");
        const internJobs = await pool.query("SELECT title, company, location FROM jobs WHERE LOWER(title) LIKE '%intern%' OR LOWER(type) LIKE '%intern%' ORDER BY id DESC LIMIT 5");
        const total = jobResult.rows[0]?.total || 0;

        if (internJobs.rows.length > 0) {
          let list = internJobs.rows.map((j, i) => `${i + 1}. **${j.title}** at ${j.company} (${j.location || "Remote"})`).join("\n");
          reply = `🎓 **Internship Opportunities:**\n\nFound **${total} internship listings** in the system.\n\n**Latest Internships:**\n${list}\n\n👉 Visit **Jobs & Internships** and filter by type to see all internships!`;
        } else {
          reply = `🎓 **Internships:**\n\nNo dedicated internship listings found right now, but many job postings accept freshers!\n\n👉 Visit **Jobs & Internships** and look for "Entry Level" or "Junior" roles. Also check platforms like **Internshala**, **LinkedIn**, and **AngelList** for more options.`;
        }
      } catch (e) {
        reply = "🎓 Check the **Jobs & Internships** section and filter for internship opportunities!";
      }
    }

    // ===== EVENTS / HACKATHONS =====
    else if (has("event", "hackathon", "competition", "contest", "meetup", "workshop", "webinar", "conference")) {
      try {
        const eventResult = await pool.query("SELECT COUNT(*) as total FROM events");
        const recentEvents = await pool.query("SELECT title, organizer, date, type FROM events ORDER BY id DESC LIMIT 5");
        const total = eventResult.rows[0]?.total || 0;
        let eventList = recentEvents.rows.map((e, i) => `${i + 1}. **${e.title}** by ${e.organizer || "N/A"} — ${e.date || "TBD"}`).join("\n");

        reply = `📅 **Upcoming Events & Hackathons:**\n\nThere are **${total} events** from Devfolio, Unstop, Devpost, Eventbrite, and MLH.\n\n**Latest Events:**\n${eventList}\n\n👉 Visit the **Events** section to register and participate!`;
      } catch (e) {
        reply = "📅 Check the **Events** section for live hackathons and competitions!";
      }
    }

    // ===== RESUME DOWNLOAD / TEMPLATE =====
    else if (has("resume") && has("download", "template", "sample", "format")) {
      reply = `📥 **Resume Templates Available:**\n\nI have 3 professional resume templates ready for download:\n\n• **Professional** — Clean, ATS-friendly format ideal for corporate roles\n• **Modern** — Creative design with color accents for tech & design roles\n• **Minimal** — Sleek, single-column layout for experienced professionals\n\nClick the buttons below to download your preferred template!`;
    }

    // ===== RESUME TIPS / ATS =====
    else if (has("resume") && has("tip", "ats", "improve", "better", "optimize", "score", "review")) {
      reply = `📄 **ATS Resume Tips:**\n\n1. **Use standard section headers** — Education, Experience, Skills, Projects\n2. **Include keywords** from the job description — ATS scans for exact matches\n3. **Avoid tables, images, and fancy formatting** — ATS can't parse them\n4. **Use standard fonts** — Arial, Calibri, Times New Roman\n5. **Save as PDF** — Most ATS systems prefer PDF format\n6. **Quantify achievements** — "Increased sales by 30%" > "Improved sales"\n7. **Keep it 1-2 pages** — Recruiters spend 6 seconds on initial scan\n8. **Tailor for each job** — Customize your resume for every application\n\n👉 Use our **Resume Analyzer** to check your ATS score against any job description!`;
    }

    // ===== RESUME ANALYZER =====
    else if (has("resume") && has("analy", "check", "scan", "upload")) {
      reply = `🤖 **Resume Analyzer:**\n\nOur AI-powered Resume Analyzer will:\n\n• Score your resume against a job description (ATS compatibility)\n• Highlight missing keywords and sections\n• Give actionable improvement suggestions\n\n**How to use:**\n1. Go to **Resume Analyzer** in the sidebar\n2. Upload your resume (PDF, DOCX, or TXT)\n3. Paste the job description\n4. Get your score instantly!\n\n👉 Click **Resume Analyzer** in the sidebar to get started!`;
    }

    // ===== CAREER ROADMAP =====
    else if (has("career", "roadmap", "guidance", "path", "become", "how to become", "want to be")) {
      if (role === "college") {
        reply = `🎯 **Career Guidance for Your Students:**\n\nThe platform offers **50+ career roadmaps** covering:\n\n• Software Development, Data Science, AI/ML\n• Cybersecurity, Cloud Computing, DevOps\n• UI/UX Design, Product Management\n• Mobile Development, Blockchain, Game Dev\n\nEach roadmap includes step-by-step learning paths with external links. Encourage your students to explore the Career section!`;
      } else {
        reply = `🗺️ **Career Roadmap Suggestions:**\n\nWe have **50+ detailed career roadmaps** including:\n\n• **Software Developer** — JavaScript, React, Node.js, System Design\n• **Data Scientist** — Python, SQL, ML, Statistics\n• **AI/ML Engineer** — TensorFlow, PyTorch, Deep Learning\n• **DevOps Engineer** — Docker, Kubernetes, CI/CD\n• **Cybersecurity** — Ethical Hacking, Cryptography, SOC\n• **Mobile Dev** — React Native, Flutter, Swift\n• **Cloud Architect** — AWS, Azure, GCP\n\nEach path includes learning resources, project ideas, and certification suggestions.\n\n👉 Visit the **Career** section in the sidebar to explore!`;
      }
    }

    // ===== INTERVIEW TIPS =====
    else if (has("interview", "prepare", "preparation", "crack", "clear")) {
      reply = `🎤 **Interview Preparation Tips:**\n\n**Before the Interview:**\n• Research the company — mission, products, recent news\n• Review the job description and match your skills\n• Prepare STAR method answers (Situation, Task, Action, Result)\n\n**Technical Rounds:**\n• Practice DSA on **LeetCode**, **HackerRank**, **CodeForces**\n• Review system design basics for senior roles\n• Be ready to explain your projects in depth\n\n**HR / Behavioral:**\n• "Tell me about yourself" — prepare a 2-min pitch\n• "Why this company?" — show genuine interest\n• "Your biggest weakness?" — be honest but show growth\n\n**General:**\n• Dress professionally (even for virtual interviews)\n• Test your setup for video calls\n• Send a thank-you email within 24 hours\n\n💡 Practice mock interviews with friends or on **Pramp** / **InterviewBit**!`;
    }

    // ===== SALARY / PACKAGE =====
    else if (has("salary", "package", "ctc", "compensation", "pay", "stipend", "lpa")) {
      reply = `💰 **Salary Expectations (India, 2025-26):**\n\n**Freshers (0-1 years):**\n• Service-based (TCS, Infosys, Wipro): ₹3.5 – 6 LPA\n• Product-based (mid-tier): ₹6 – 12 LPA\n• Top product (Google, Microsoft, Amazon): ₹15 – 45 LPA\n• Startups: ₹4 – 15 LPA (varies widely)\n\n**Internship Stipends:**\n• Average: ₹10,000 – 30,000/month\n• Top companies: ₹40,000 – 1,00,000/month\n\n**Tips to get higher packages:**\n• Strong DSA & problem-solving skills\n• Good projects on GitHub\n• Open-source contributions\n• Competitive programming ratings\n• Relevant internship experience\n\n👉 Check the **Jobs & Internships** section for actual salary info in listings!`;
    }

    // ===== SKILLS =====
    else if (has("skill", "learn", "technology", "tech stack", "language") && has("what", "which", "should", "recommend", "suggest", "best", "top", "trending")) {
      reply = `🛠️ **Trending Skills for 2025-26:**\n\n**Most In-Demand:**\n• **AI/ML** — Python, TensorFlow, PyTorch, LLMs\n• **Full Stack** — React, Node.js, TypeScript, Next.js\n• **Cloud** — AWS, Azure, GCP, Terraform\n• **Data** — SQL, Python, Power BI, Spark\n• **DevOps** — Docker, Kubernetes, CI/CD, GitHub Actions\n• **Cybersecurity** — Ethical Hacking, SIEM, SOC\n\n**Always Valuable:**\n• Git & Version Control\n• Problem Solving (DSA)\n• System Design\n• Communication & Teamwork\n\n👉 Visit the **Career** section to find learning paths for each skill!`;
    }

    // ===== PROFILE =====
    else if (has("profile", "account", "my info", "my detail", "my data", "who am i")) {
      if (userProfile) {
        reply = `👤 **Your Profile:**\n\n• **Name:** ${userProfile.name}\n• **Email:** ${userProfile.email}\n• **Role:** ${userProfile.role}\n• **College:** ${userProfile.college || "Not set"}\n${userProfile.role === "student" ? `• **Pass-out Year:** ${userProfile.pass_out_year || "Not set"}` : `• **Department:** ${userProfile.department || "Not set"}`}\n• **Phone:** ${userProfile.phone || "Not set"}\n• **Login Count:** ${userProfile.login_count || 0}\n\n👉 Visit the **Profile** section to update your information.`;
      } else {
        reply = "Please visit the **Profile** section to view and manage your account details.";
      }
    }

    // ===== STUDENT STATS (College) =====
    else if (has("student") && has("stat", "count", "directory", "list", "total", "number", "how many")) {
      if (role === "college") {
        try {
          const college = userProfile?.college;
          let studentQ = "SELECT COUNT(*) as total FROM profile WHERE role='student'";
          let params = [];
          if (college) {
            studentQ += " AND college=$1";
            params = [college];
          }
          const studentCount = await pool.query(studentQ, params);
          const total = studentCount.rows[0]?.total || 0;
          const jobCount = await pool.query("SELECT COUNT(*) as total FROM jobs");
          const eventCount = await pool.query("SELECT COUNT(*) as total FROM events");

          reply = `📊 **Dashboard Statistics:**\n\n• **Students${college ? ` (${college})` : ""}:** ${total}\n• **Active Job Listings:** ${jobCount.rows[0]?.total || 0}\n• **Live Events:** ${eventCount.rows[0]?.total || 0}\n\nVisit the **Student Information** section to view detailed records.`;
        } catch (e) {
          reply = "Visit the **Student Information** section to browse registered students.";
        }
      } else {
        reply = "Visit the **Community** section to connect with other students from your college!";
      }
    }

    // ===== CAF FORM =====
    else if (has("caf", "company application", "placement form", "campus drive")) {
      if (role === "college") {
        try {
          const cafCount = await pool.query("SELECT COUNT(*) as total FROM caf_forms");
          reply = `📝 **CAF Forms (Company Application Forms):**\n\nCAF Forms help you manage placement drives. Currently **${cafCount.rows[0]?.total || 0} forms** in the system.\n\n**You can:**\n• Create new CAF forms with company details, job roles, and eligibility\n• Track application deadlines\n• Update form status (pending/approved/rejected)\n• Delete outdated forms\n\n👉 Go to **CAF Form** in the sidebar to manage placement drives!`;
        } catch (e) {
          reply = "📝 Go to **CAF Form** in the sidebar to create and manage Company Application Forms for placements!";
        }
      } else {
        reply = "📝 CAF Forms are managed by your college's placement cell. Contact your placement officer for details about upcoming campus drives!";
      }
    }

    // ===== PLACEMENT STATS =====
    else if (has("placement", "placed", "offer")) {
      try {
        const totalStudents = await pool.query("SELECT COUNT(*) as total FROM profile WHERE role='student'");
        const placed = await pool.query("SELECT COUNT(DISTINCT student_id) as total FROM applications WHERE status='selected'");
        const totalApps = await pool.query("SELECT COUNT(*) as total FROM applications");
        const students = parseInt(totalStudents.rows[0]?.total) || 0;
        const placedCount = parseInt(placed.rows[0]?.total) || 0;
        const pct = students > 0 ? ((placedCount / students) * 100).toFixed(1) : 0;

        reply = `📊 **Placement Statistics:**\n\n• **Total Students:** ${students}\n• **Students Placed:** ${placedCount}\n• **Placement Rate:** ${pct}%\n• **Total Applications:** ${totalApps.rows[0]?.total || 0}\n\n${role === "college" ? "Visit **Student Information** to see detailed records." : "Visit **Applications** in the sidebar to track your application status!"}`;
      } catch (e) {
        reply = "📊 Visit the dashboard to view the latest placement statistics!";
      }
    }

    // ===== COMMUNITY =====
    else if (has("community", "forum", "discussion", "group", "alumni")) {
      try {
        const commCount = await pool.query("SELECT COUNT(*) as total FROM communities");
        reply = `🤝 **Community:**\n\nThere are **${commCount.rows[0]?.total || 0} communities** on the platform.\n\n• Create and join **college-specific communities**\n• Post updates, share resources, ask questions\n• Network with students and alumni\n• Password-protected communities available\n\n👉 Visit the **Community** section in the sidebar!`;
      } catch (e) {
        reply = "🤝 Visit the **Community** section to connect with other students!";
      }
    }

    // ===== WHO BUILT THIS / ABOUT =====
    else if (has("who built", "who made", "who created", "about", "developer", "about this", "about hack")) {
      reply = `ℹ️ **About Hack-2-Hire:**\n\nHack-2-Hire is an AI-powered placement and career platform that helps:\n\n• **Students** — Find jobs, build resumes, explore careers, and prepare for placements\n• **Colleges** — Manage students, track placements, and coordinate with companies\n\n**Key Features:**\n• Real-time job scraping from 11+ sources\n• AI Resume Analyzer (ATS scoring)\n• 50+ Career Roadmaps\n• Live hackathon & event aggregation\n• Community forums & networking\n\nBuilt with ❤️ using React, Node.js, and SQLite.`;
    }

    // ===== THANK YOU =====
    else if (has("thank", "thanks", "thx", "appreciate")) {
      const thanks = [
        `You're welcome! 😊 Feel free to ask anytime!`,
        `Happy to help, ${userName}! 🙌 Let me know if you need anything else.`,
        `Anytime! 😄 I'm here to help you ${role === "college" ? "manage your dashboard" : "with your career journey"}!`,
      ];
      reply = thanks[Math.floor(Math.random() * thanks.length)];
    }

    // ===== BYE =====
    else if (has("bye", "goodbye", "see you", "later", "gtg", "gotta go") && query.length < 30) {
      reply = `Goodbye, ${userName}! 👋 All the best ${role === "college" ? "with your placements" : "with your career"}! Come back anytime. 🚀`;
    }

    // ===== COMPLIMENT =====
    else if (has("great", "awesome", "amazing", "nice", "cool", "good bot", "smart", "helpful", "love")) {
      reply = `Thank you! 😊 That means a lot! I'm always improving to serve you better. Let me know if there's anything else I can help with! 🚀`;
    }

    // ===== DEFAULT =====
    else {
      if (role === "college") {
        reply = `I'm not sure I understand that. Here's what I can help with:\n\n• **"Student statistics"** — View student count & data\n• **"Job listings"** — See current job postings\n• **"Events"** — Browse upcoming hackathons\n• **"CAF forms"** — Manage placement drives\n• **"Placement stats"** — View placement analytics\n• **"How does the system work?"** — Platform overview\n• **"Help"** — See all my capabilities\n\nTry asking one of these! 🎯`;
      } else {
        reply = `I'm not sure I understand that. Here's what I can help with:\n\n• **"Show me jobs"** — Latest job openings\n• **"Internships"** — Find internship roles\n• **"Download resume template"** — Professional templates\n• **"Career roadmap"** — Explore career paths\n• **"Interview tips"** — Prep for interviews\n• **"Salary expectations"** — Know your worth\n• **"Resume tips"** — ATS optimization\n• **"Help"** — See all my capabilities\n\nTry asking one of these! 🎯`;
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ reply: "Sorry, I encountered an error. Please try again." });
  }
});

// ===== RESUME TEMPLATE DOWNLOAD =====
app.get("/chatbot/download-resume", (req, res) => {
  const template = req.query.template || "professional";

  const templates = {
    professional: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Professional Resume</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;color:#333;max-width:800px;margin:0 auto;padding:40px}.header{text-align:center;border-bottom:3px solid #1a2a6c;padding-bottom:20px;margin-bottom:25px}.header h1{font-size:28px;color:#1a2a6c;margin-bottom:5px}.header p{font-size:14px;color:#555}.section{margin-bottom:22px}.section h2{font-size:16px;text-transform:uppercase;color:#1a2a6c;border-bottom:1px solid #ddd;padding-bottom:5px;margin-bottom:12px;letter-spacing:1px}.section .item{margin-bottom:12px}.section .item h3{font-size:15px;font-weight:bold}.section .item .meta{font-size:13px;color:#666;margin:2px 0}.section .item p{font-size:14px;line-height:1.5}.skills{display:flex;flex-wrap:wrap;gap:8px}.skills span{background:#f0f4ff;color:#1a2a6c;padding:4px 12px;border-radius:4px;font-size:13px}</style></head><body><div class="header"><h1>YOUR FULL NAME</h1><p>📧 email@example.com | 📱 +91-XXXXXXXXXX | 📍 City, India | 🔗 linkedin.com/in/yourname</p></div><div class="section"><h2>Professional Summary</h2><p>Results-driven software engineer with X+ years of experience in full-stack development. Proficient in JavaScript, React, Node.js, and cloud technologies. Passionate about building scalable applications.</p></div><div class="section"><h2>Experience</h2><div class="item"><h3>Software Engineer — Company Name</h3><p class="meta">Jan 2024 – Present | City, India</p><p>• Developed and maintained web applications serving 10,000+ daily active users<br>• Reduced API response time by 40% through query optimization<br>• Led a team of 3 developers for the payment integration module</p></div><div class="item"><h3>Software Engineering Intern — Company Name</h3><p class="meta">Jun 2023 – Dec 2023 | City, India</p><p>• Built RESTful APIs using Node.js and Express<br>• Implemented responsive UI components using React<br>• Wrote unit tests achieving 85% code coverage</p></div></div><div class="section"><h2>Education</h2><div class="item"><h3>B.Tech in Computer Science — University Name</h3><p class="meta">2020 – 2024 | CGPA: 8.5/10</p></div></div><div class="section"><h2>Skills</h2><div class="skills"><span>JavaScript</span><span>React</span><span>Node.js</span><span>Python</span><span>SQL</span><span>Git</span><span>AWS</span><span>Docker</span><span>MongoDB</span><span>REST APIs</span></div></div><div class="section"><h2>Projects</h2><div class="item"><h3>E-Commerce Platform</h3><p>• Full-stack application built with React, Node.js, and MongoDB<br>• Implemented payment gateway, user authentication, and admin dashboard</p></div></div></body></html>`,

    modern: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Modern Resume</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;color:#333;display:flex;min-height:100vh}.sidebar{width:280px;background:linear-gradient(180deg,#1a2a6c,#2d47a8);color:#fff;padding:35px 25px}.sidebar h1{font-size:22px;margin-bottom:5px}.sidebar .subtitle{font-size:12px;opacity:0.8;margin-bottom:25px}.sidebar .section{margin-bottom:22px}.sidebar .section h2{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;opacity:0.7;margin-bottom:10px}.sidebar .section p,.sidebar .section li{font-size:13px;line-height:1.6;list-style:none}.sidebar .contact-item{margin-bottom:8px;font-size:12px}.skills-grid{display:flex;flex-wrap:wrap;gap:6px}.skills-grid span{background:rgba(255,255,255,0.15);padding:4px 10px;border-radius:15px;font-size:11px}.main{flex:1;padding:35px 30px;background:#fff}.main .section{margin-bottom:24px}.main .section h2{font-size:16px;color:#1a2a6c;border-left:4px solid #1a2a6c;padding-left:12px;margin-bottom:14px}.main .item{margin-bottom:14px;padding-left:12px;border-left:2px solid #e0e4ef}.main .item h3{font-size:14px;color:#333}.main .item .meta{font-size:12px;color:#888;margin:3px 0}.main .item p{font-size:13px;line-height:1.6;color:#555}</style></head><body><div class="sidebar"><h1>YOUR NAME</h1><p class="subtitle">Software Engineer</p><div class="section"><h2>Contact</h2><div class="contact-item">📧 email@example.com</div><div class="contact-item">📱 +91-XXXXXXXXXX</div><div class="contact-item">📍 City, India</div><div class="contact-item">🔗 linkedin.com/in/you</div><div class="contact-item">💻 github.com/you</div></div><div class="section"><h2>Skills</h2><div class="skills-grid"><span>React</span><span>Node.js</span><span>Python</span><span>TypeScript</span><span>AWS</span><span>Docker</span><span>SQL</span><span>Git</span><span>MongoDB</span></div></div><div class="section"><h2>Languages</h2><p>English — Fluent</p><p>Hindi — Native</p></div><div class="section"><h2>Interests</h2><p>Open Source, Hackathons, Tech Blogging, AI Research</p></div></div><div class="main"><div class="section"><h2>Professional Summary</h2><p>Creative and detail-oriented software engineer with expertise in modern web technologies. Experience in building high-performance applications with a focus on user experience.</p></div><div class="section"><h2>Experience</h2><div class="item"><h3>Full Stack Developer — Company Name</h3><p class="meta">2024 – Present</p><p>• Architected microservices handling 50K+ daily requests<br>• Built real-time dashboards using React and WebSockets<br>• Mentored 2 junior developers</p></div><div class="item"><h3>Software Intern — Company Name</h3><p class="meta">2023 – 2024</p><p>• Developed REST APIs and integrated third-party services<br>• Improved CI/CD pipeline reducing deployment time by 60%</p></div></div><div class="section"><h2>Education</h2><div class="item"><h3>B.Tech Computer Science — University</h3><p class="meta">2020 – 2024 | CGPA: 9.0</p></div></div><div class="section"><h2>Projects</h2><div class="item"><h3>AI Chat Application</h3><p>Real-time chat app with AI-powered response suggestions. Built using React, Node.js, and OpenAI API.</p></div></div></div></body></html>`,

    minimal: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Minimal Resume</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#222;max-width:700px;margin:0 auto;padding:50px 30px;line-height:1.6}h1{font-size:26px;font-weight:300;letter-spacing:-0.5px}h1 strong{font-weight:700}.contact{font-size:13px;color:#888;margin:6px 0 30px;display:flex;gap:15px;flex-wrap:wrap}.contact span{white-space:nowrap}hr{border:none;border-top:1px solid #eee;margin:0}section{padding:18px 0}section h2{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:14px}.entry{display:flex;justify-content:space-between;margin-bottom:14px}.entry-left h3{font-size:14px;font-weight:600}.entry-left p{font-size:13px;color:#666}.entry-right{font-size:12px;color:#999;text-align:right;white-space:nowrap;min-width:120px}.details{font-size:13px;color:#555;margin-top:4px}.skills-list{display:flex;flex-wrap:wrap;gap:8px;list-style:none}.skills-list li{font-size:13px;color:#555}</style></head><body><h1><strong>Your</strong> Name</h1><div class="contact"><span>email@example.com</span><span>+91-XXXXXXXXXX</span><span>City, India</span><span>linkedin.com/in/you</span></div><hr><section><h2>Experience</h2><div class="entry"><div class="entry-left"><h3>Software Engineer</h3><p>Company Name</p><p class="details">Built scalable web applications, optimized database queries, led feature development for core product.</p></div><div class="entry-right">2024 — Present<br>City</div></div><div class="entry"><div class="entry-left"><h3>Engineering Intern</h3><p>Company Name</p><p class="details">Developed APIs, wrote tests, contributed to open-source tooling.</p></div><div class="entry-right">2023 — 2024<br>City</div></div></section><hr><section><h2>Education</h2><div class="entry"><div class="entry-left"><h3>B.Tech Computer Science</h3><p>University Name — CGPA 8.8</p></div><div class="entry-right">2020 — 2024</div></div></section><hr><section><h2>Skills</h2><ul class="skills-list"><li>JavaScript</li><li>•</li><li>React</li><li>•</li><li>Node.js</li><li>•</li><li>Python</li><li>•</li><li>SQL</li><li>•</li><li>Git</li><li>•</li><li>Docker</li><li>•</li><li>AWS</li></ul></section></body></html>`
  };

  const htmlContent = templates[template] || templates.professional;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Content-Disposition", `attachment; filename="${template}_resume_template.html"`);
  res.send(htmlContent);
});

// ===== CAF FORMS (College Application Forms) =====
app.get("/caf-forms", async (req, res) => {
  try {
    const { college_id } = req.query;
    let query = "SELECT * FROM caf_forms ORDER BY created_at DESC";
    let params = [];
    if (college_id) {
      query = "SELECT * FROM caf_forms WHERE college_id=$1 ORDER BY created_at DESC";
      params = [college_id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch CAF forms error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch CAF forms" });
  }
});

app.post("/caf-forms", async (req, res) => {
  try {
    const { college_id, company_name, company_email, company_phone, job_role, job_description, eligibility_criteria, salary_package, application_deadline } = req.body;
    if (!college_id || !company_name || !job_role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const result = await pool.query(
      `INSERT INTO caf_forms (college_id, company_name, company_email, company_phone, job_role, job_description, eligibility_criteria, salary_package, application_deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [college_id, company_name, company_email, company_phone, job_role, job_description, eligibility_criteria, salary_package, application_deadline]
    );
    res.json({ id: result.lastID, company_name, job_role, status: 'pending' });
  } catch (err) {
    console.error("Create CAF form error:", err);
    res.status(500).json({ error: err.message || "Failed to create CAF form" });
  }
});

app.put("/caf-forms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, company_email, company_phone, job_role, job_description, eligibility_criteria, salary_package, application_deadline, status } = req.body;
    await pool.query(
      `UPDATE caf_forms SET company_name=$1, company_email=$2, company_phone=$3, job_role=$4, job_description=$5, eligibility_criteria=$6, salary_package=$7, application_deadline=$8, status=$9 WHERE id=$10`,
      [company_name, company_email, company_phone, job_role, job_description, eligibility_criteria, salary_package, application_deadline, status, id]
    );
    res.json({ message: "CAF form updated successfully" });
  } catch (err) {
    console.error("Update CAF form error:", err);
    res.status(500).json({ error: err.message || "Failed to update CAF form" });
  }
});

app.delete("/caf-forms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM caf_forms WHERE id=$1", [id]);
    res.json({ message: "CAF form deleted successfully" });
  } catch (err) {
    console.error("Delete CAF form error:", err);
    res.status(500).json({ error: err.message || "Failed to delete CAF form" });
  }
});

// ===== STUDENTS INFO (for college dashboard) =====
app.get("/students", async (req, res) => {
  try {
    const { college } = req.query;
    let query = "SELECT id, name, email, college, pass_out_year, login_count, created_at FROM profile WHERE role='student' ORDER BY created_at DESC";
    let params = [];
    if (college) {
      query = "SELECT id, name, email, college, pass_out_year, login_count, created_at FROM profile WHERE role='student' AND college=$1 ORDER BY created_at DESC";
      params = [college];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch students error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
});

// ===== ADMIN STATS =====
app.get("/admin/stats", async (req, res) => {
  try {
    const totalUsers = await pool.query("SELECT COUNT(*) as count FROM profile");
    const totalStudents = await pool.query("SELECT COUNT(*) as count FROM profile WHERE role='student'");
    const totalColleges = await pool.query("SELECT COUNT(*) as count FROM profile WHERE role='college'");
    const totalCommunities = await pool.query("SELECT COUNT(*) as count FROM communities");
    const totalCAFForms = await pool.query("SELECT COUNT(*) as count FROM caf_forms");
    const totalCompanies = await pool.query("SELECT COUNT(*) as count FROM companies");
    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalStudents: parseInt(totalStudents.rows[0].count),
      totalColleges: parseInt(totalColleges.rows[0].count),
      totalCommunities: parseInt(totalCommunities.rows[0].count),
      totalCAFForms: parseInt(totalCAFForms.rows[0].count),
      totalCompanies: parseInt(totalCompanies.rows[0].count),
    });
  } catch (err) {
    console.error("Fetch admin stats error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch admin stats" });
  }
});

// ===== GET ALL COLLEGES =====
app.get("/colleges", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, college, department, phone, created_at FROM profile WHERE role='college' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch colleges error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch colleges" });
  }
});

// ===== COMPANIES =====
app.get("/companies", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM companies ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch companies error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch companies" });
  }
});

app.post("/companies", async (req, res) => {
  try {
    const { name, email, phone, website, industry, description } = req.body;
    if (!name) return res.status(400).json({ error: "Company name is required" });
    const result = await pool.query(
      `INSERT INTO companies (name, email, phone, website, industry, description) VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, phone, website, industry, description]
    );
    res.json({ id: result.lastID, name, email, phone, website, industry, description });
  } catch (err) {
    console.error("Create company error:", err);
    res.status(500).json({ error: err.message || "Failed to create company" });
  }
});

// ===== DOCUMENTS =====
app.get("/documents", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM documents ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch documents" });
  }
});

app.post("/documents", async (req, res) => {
  try {
    const { title, description, file_url, uploaded_by, document_type } = req.body;
    if (!title || !file_url) return res.status(400).json({ error: "Title and file URL are required" });
    const result = await pool.query(
      `INSERT INTO documents (title, description, file_url, uploaded_by, document_type) VALUES ($1, $2, $3, $4, $5)`,
      [title, description, file_url, uploaded_by, document_type]
    );
    res.json({ id: result.lastID, title, description, file_url, uploaded_by, document_type });
  } catch (err) {
    console.error("Create document error:", err);
    res.status(500).json({ error: err.message || "Failed to create document" });
  }
});

// ===== STUDENT DASHBOARD STATS =====
app.get("/student/dashboard-stats/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const totalApplications = await pool.query("SELECT COUNT(*) as count FROM applications WHERE student_id=$1", [studentId]);
    const shortlisted = await pool.query("SELECT COUNT(*) as count FROM applications WHERE student_id=$1 AND status='shortlisted'", [studentId]);
    const interviews = await pool.query("SELECT COUNT(*) as count FROM applications WHERE student_id=$1 AND status='interview'", [studentId]);
    const offers = await pool.query("SELECT COUNT(*) as count FROM applications WHERE student_id=$1 AND status='selected'", [studentId]);
    const totalJobs = await pool.query("SELECT COUNT(*) as count FROM jobs");
    const profile = await pool.query("SELECT * FROM student_profiles WHERE student_id=$1", [studentId]);
    res.json({
      totalJobs: parseInt(totalJobs.rows[0].count),
      totalInternships: parseInt(totalJobs.rows[0].count),
      applicationsSubmitted: parseInt(totalApplications.rows[0].count),
      shortlisted: parseInt(shortlisted.rows[0].count),
      upcomingInterviews: parseInt(interviews.rows[0].count),
      offers: parseInt(offers.rows[0].count),
      profileCompletion: profile.rows[0]?.profile_completion || 0,
      resumeUploaded: profile.rows[0]?.resume_uploaded || false,
    });
  } catch (err) {
    console.error("Fetch student stats error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch student stats" });
  }
});

// ===== APPLICATIONS =====
app.get("/applications/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await pool.query(
      "SELECT * FROM applications WHERE student_id=$1 ORDER BY applied_date DESC",
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch applications error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch applications" });
  }
});

app.post("/applications", async (req, res) => {
  try {
    const { student_id, company_name, role, location, status } = req.body;
    if (!student_id || !company_name || !role) return res.status(400).json({ error: "Missing required fields" });
    const result = await pool.query(
      `INSERT INTO applications (student_id, company_name, role, location, status) VALUES ($1, $2, $3, $4, $5)`,
      [student_id, company_name, role, location || null, status || 'applied']
    );
    res.json({ id: result.lastID, student_id, company_name, role, location, status: status || 'applied' });
  } catch (err) {
    console.error("Create application error:", err);
    res.status(500).json({ error: err.message || "Failed to create application" });
  }
});

// ===== STUDENT PROFILE =====
app.get("/student-profile/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    let result = await pool.query("SELECT * FROM student_profiles WHERE student_id=$1", [studentId]);
    if (result.rows.length === 0) {
      result = await pool.query(
        "INSERT INTO student_profiles (student_id) VALUES ($1)",
        [studentId]
      );
      result = await pool.query("SELECT * FROM student_profiles WHERE student_id=$1", [studentId]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch student profile error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch student profile" });
  }
});

app.put("/student-profile/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { resume_uploaded, resume_url, skills, course, profile_completion } = req.body;
    await pool.query(
      `UPDATE student_profiles SET resume_uploaded=$1, resume_url=$2, skills=$3, course=$4, profile_completion=$5 WHERE student_id=$6`,
      [resume_uploaded, resume_url, skills, course, profile_completion, studentId]
    );
    const result = await pool.query("SELECT * FROM student_profiles WHERE student_id=$1", [studentId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update student profile error:", err);
    res.status(500).json({ error: err.message || "Failed to update student profile" });
  }
});

// ===== PLACEMENT EVENTS =====
app.get("/placement-events", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM placement_events WHERE event_date >= date('now') ORDER BY event_date ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch placement events error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch placement events" });
  }
});

app.post("/placement-events", async (req, res) => {
  try {
    const { title, description, event_type, event_date, event_time, location, is_online, organizer_id } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: "Title and event date are required" });
    const result = await pool.query(
      `INSERT INTO placement_events (title, description, event_type, event_date, event_time, location, is_online, organizer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [title, description, event_type, event_date, event_time, location, is_online, organizer_id]
    );
    res.json({ id: result.lastID, title, event_date });
  } catch (err) {
    console.error("Create placement event error:", err);
    res.status(500).json({ error: err.message || "Failed to create placement event" });
  }
});

// ===== NOTIFICATIONS =====
app.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch notifications" });
  }
});

app.post("/notifications", async (req, res) => {
  try {
    const { user_id, title, message } = req.body;
    if (!user_id || !title) return res.status(400).json({ error: "User ID and title are required" });
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
      [user_id, title, message]
    );
    res.json({ id: result.lastID, user_id, title, message, is_read: false });
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ error: err.message || "Failed to create notification" });
  }
});

app.put("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE notifications SET is_read=1 WHERE id=$1", [id]);
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ error: err.message || "Failed to mark notification as read" });
  }
});

// ===== COLLEGE ANALYTICS =====
app.get("/college/analytics", async (req, res) => {
  try {
    const { college } = req.query;

    let studentQuery = "SELECT COUNT(*) as count FROM profile WHERE role='student'";
    let offerQuery = "SELECT COUNT(*) as count FROM applications WHERE status='selected'";
    let placementQuery = "SELECT COUNT(DISTINCT student_id) as count FROM applications WHERE status='selected'";
    let cafQuery = "SELECT COUNT(*) as count FROM caf_forms";
    let params = [];

    if (college) {
      studentQuery += " AND college=$1";
      offerQuery = "SELECT COUNT(*) as count FROM applications a JOIN profile p ON a.student_id = p.id WHERE a.status='selected' AND p.college=$1";
      placementQuery = "SELECT COUNT(DISTINCT a.student_id) as count FROM applications a JOIN profile p ON a.student_id = p.id WHERE a.status='selected' AND p.college=$1";
      cafQuery = "SELECT COUNT(*) as count FROM caf_forms cf JOIN profile p ON cf.college_id = p.id WHERE p.college=$1";
      params = [college];
    }

    const totalStudents = await pool.query(studentQuery, params);
    const totalCompanies = await pool.query("SELECT COUNT(*) as count FROM companies");
    const totalOffers = await pool.query(offerQuery, params);
    const totalPlacements = await pool.query(placementQuery, params);
    const totalCAF = await pool.query(cafQuery, params);
    const totalEvents = await pool.query("SELECT COUNT(*) as count FROM events");

    const placementPercentage = parseInt(totalStudents.rows[0].count) > 0
      ? ((parseInt(totalPlacements.rows[0].count) / parseInt(totalStudents.rows[0].count)) * 100).toFixed(2)
      : 0;

    res.json({
      totalStudents: parseInt(totalStudents.rows[0].count),
      totalCompanies: parseInt(totalCompanies.rows[0].count),
      totalOffers: parseInt(totalOffers.rows[0].count),
      totalPlacements: parseInt(totalPlacements.rows[0].count),
      totalCAF: parseInt(totalCAF.rows[0].count),
      totalEvents: parseInt(totalEvents.rows[0].count),
      placementPercentage: parseFloat(placementPercentage),
    });
  } catch (err) {
    console.error("Fetch college analytics error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch college analytics" });
  }
});

// ===== COMMUNITY EXTENDED ROUTES =====
app.get("/communities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM communities WHERE id=$1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Community not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch community error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch community" });
  }
});

app.post("/communities/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, password } = req.body;
    if (!user_id) return res.status(400).json({ error: "User ID is required" });
    const existing = await pool.query(
      "SELECT * FROM community_members WHERE community_id=$1 AND user_id=$2",
      [id, user_id]
    );
    if (existing.rows.length > 0) return res.status(400).json({ error: "Already a member" });
    if (password) {
      const community = await pool.query("SELECT * FROM communities WHERE id=$1", [id]);
      if (community.rows[0]?.password) {
        const match = await bcrypt.compare(password, community.rows[0].password);
        if (!match) return res.status(400).json({ error: "Invalid community password" });
      }
    }
    await pool.query(
      "INSERT INTO community_members (community_id, user_id) VALUES ($1, $2)",
      [id, user_id]
    );
    res.json({ message: "Successfully joined community" });
  } catch (err) {
    console.error("Join community error:", err);
    res.status(500).json({ error: err.message || "Failed to join community" });
  }
});

app.get("/communities/:id/is-member/:userId", async (req, res) => {
  try {
    const { id, userId } = req.params;
    const result = await pool.query(
      "SELECT * FROM community_members WHERE community_id=$1 AND user_id=$2",
      [id, userId]
    );
    res.json({ isMember: result.rows.length > 0 });
  } catch (err) {
    console.error("Check membership error:", err);
    res.status(500).json({ error: err.message || "Failed to check membership" });
  }
});

app.get("/communities/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.id, p.name, p.email, p.role, cm.joined_at
       FROM community_members cm
       JOIN profile p ON cm.user_id = p.id
       WHERE cm.community_id = $1
       ORDER BY cm.joined_at DESC`, [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch members error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch members" });
  }
});

app.get("/communities/:id/posts", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT cp.*, p.name as author_name, p.role as author_role
       FROM community_posts cp
       JOIN profile p ON cp.user_id = p.id
       WHERE cp.community_id = $1
       ORDER BY cp.created_at DESC`, [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch posts" });
  }
});

app.post("/communities/:id/posts", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, content, post_type } = req.body;
    if (!user_id || !content) return res.status(400).json({ error: "User ID and content are required" });
    const result = await pool.query(
      `INSERT INTO community_posts (community_id, user_id, content, post_type) VALUES ($1, $2, $3, $4)`,
      [id, user_id, content, post_type || 'post']
    );
    res.json({ id: result.lastID, community_id: id, user_id, content, post_type: post_type || 'post' });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: err.message || "Failed to create post" });
  }
});

app.delete("/communities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM community_posts WHERE community_id=$1", [id]);
    await pool.query("DELETE FROM community_members WHERE community_id=$1", [id]);
    await pool.query("DELETE FROM communities WHERE id=$1", [id]);
    res.json({ message: "Community deleted successfully" });
  } catch (err) {
    console.error("Delete community error:", err);
    res.status(500).json({ error: err.message || "Failed to delete community" });
  }
});

// ===== PLACEMENT TRACKING APIs =====

// Get placement overview statistics
app.get("/placement/overview/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;

    // Get college name of this user
    const collegeResult = await pool.query("SELECT college FROM profile WHERE id=$1", [collegeId]);
    const collegeName = collegeResult.rows[0]?.college;

    let query = `
      SELECT 
        COUNT(DISTINCT sp.student_id) as total_students,
        COUNT(DISTINCT CASE WHEN sp.eligibility_status = 'Eligible' THEN sp.student_id END) as eligible_students,
        COUNT(DISTINCT CASE WHEN sp.is_placed = 1 THEN sp.student_id END) as students_placed,
        COUNT(DISTINCT CASE WHEN sp.is_placed = 0 AND sp.eligibility_status = 'Eligible' THEN sp.student_id END) as students_unplaced,
        COUNT(DISTINCT CASE WHEN sp.offer_count > 1 THEN sp.student_id END) as multiple_offers,
        ROUND(AVG(CASE WHEN sp.is_placed = 1 THEN sp.package_offered END), 2) as avg_package,
        MAX(sp.package_offered) as highest_package
      FROM student_placements sp
      JOIN profile p ON sp.student_id = p.id
    `;
    let params = [];
    if (collegeName) {
      query += " WHERE p.college = $1";
      params = [collegeName];
    }

    const stats = await pool.query(query, params);
    const result = stats.rows[0];
    const placementPercentage = result.eligible_students > 0
      ? ((result.students_placed / result.eligible_students) * 100).toFixed(2)
      : 0;

    res.json({ ...result, placement_percentage: placementPercentage });
  } catch (err) {
    console.error("Placement overview error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get detailed placement tracking
app.get("/placement/tracking/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { department, status, cgpaMin, cgpaMax, year } = req.query;

    const collegeResult = await pool.query("SELECT college FROM profile WHERE id=$1", [collegeId]);
    const collegeName = collegeResult.rows[0]?.college;

    let query = `
      SELECT 
        p.id, p.name, p.department, p.pass_out_year,
        sp.cgpa, sp.eligibility_status, sp.companies_applied,
        sp.current_status, sp.offer_count, sp.package_offered, sp.is_placed,
        sp.student_id
      FROM profile p
      LEFT JOIN student_placements sp ON p.id = sp.student_id
      WHERE p.role = 'student'
    `;

    const params = [];
    let paramCount = 0;

    if (collegeName) {
      paramCount++;
      query += ` AND p.college = $${paramCount}`;
      params.push(collegeName);
    }

    if (department) {
      paramCount++;
      query += ` AND p.department = $${paramCount}`;
      params.push(department);
    }

    if (status) {
      paramCount++;
      query += ` AND sp.current_status = $${paramCount}`;
      params.push(status);
    }

    if (cgpaMin) {
      paramCount++;
      query += ` AND sp.cgpa >= $${paramCount}`;
      params.push(cgpaMin);
    }

    if (cgpaMax) {
      paramCount++;
      query += ` AND sp.cgpa <= $${paramCount}`;
      params.push(cgpaMax);
    }

    if (year) {
      paramCount++;
      query += ` AND p.pass_out_year = $${paramCount}`;
      params.push(year);
    }

    query += ` ORDER BY p.name`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Placement tracking error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get department-wise statistics
app.get("/placement/department-stats/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const collegeResult = await pool.query("SELECT college FROM profile WHERE id=$1", [collegeId]);
    const collegeName = collegeResult.rows[0]?.college;

    let query = `
      SELECT 
        p.department,
        COUNT(DISTINCT p.id) as total_students,
        COUNT(DISTINCT CASE WHEN sp.eligibility_status = 'Eligible' THEN p.id END) as eligible_students,
        COUNT(DISTINCT CASE WHEN sp.is_placed = 1 THEN p.id END) as students_placed,
        ROUND(AVG(CASE WHEN sp.is_placed = 1 THEN sp.package_offered END), 2) as avg_package,
        MAX(sp.package_offered) as highest_package
      FROM profile p
      LEFT JOIN student_placements sp ON p.id = sp.student_id
      WHERE p.role = 'student'
    `;
    let params = [];
    if (collegeName) {
      query += " AND p.college = $1";
      params = [collegeName];
    }
    query += " GROUP BY p.department ORDER BY p.department";

    const result = await pool.query(query, params);

    const stats = result.rows.map(row => ({
      ...row,
      placement_percentage: row.eligible_students > 0
        ? ((row.students_placed / row.eligible_students) * 100).toFixed(2)
        : 0
    }));

    res.json(stats);
  } catch (err) {
    console.error("Department stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get yearly placement trend
app.get("/placement/yearly-trend/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const collegeResult = await pool.query("SELECT college FROM profile WHERE id=$1", [collegeId]);
    const collegeName = collegeResult.rows[0]?.college;

    let query = `
      SELECT 
        p.pass_out_year as year,
        COUNT(DISTINCT p.id) as total_students,
        COUNT(DISTINCT CASE WHEN sp.eligibility_status = 'Eligible' THEN p.id END) as eligible_students,
        COUNT(DISTINCT CASE WHEN sp.is_placed = 1 THEN p.id END) as students_placed,
        ROUND(AVG(CASE WHEN sp.is_placed = 1 THEN sp.package_offered END), 2) as avg_package
      FROM profile p
      LEFT JOIN student_placements sp ON p.id = sp.student_id
      WHERE p.role = 'student'
        AND p.pass_out_year IS NOT NULL
    `;
    let params = [];
    if (collegeName) {
      query += " AND p.college = $1";
      params = [collegeName];
    }
    query += " GROUP BY p.pass_out_year ORDER BY p.pass_out_year DESC LIMIT 5";

    const result = await pool.query(query, params);

    const trend = result.rows.map(row => ({
      ...row,
      placement_percentage: row.eligible_students > 0
        ? ((row.students_placed / row.eligible_students) * 100).toFixed(2)
        : 0
    }));

    res.json(trend);
  } catch (err) {
    console.error("Yearly trend error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update student placement data
app.post("/placement/student", async (req, res) => {
  try {
    const { student_id, id, cgpa, eligibility_status, companies_applied, current_status, offer_count, package_offered, is_placed, graduation_year } = req.body;
    const sid = student_id || id;

    // Check if record exists
    const existing = await pool.query("SELECT * FROM student_placements WHERE student_id=$1", [sid]);

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE student_placements SET 
          cgpa=$1, eligibility_status=$2, companies_applied=$3, 
          current_status=$4, offer_count=$5, package_offered=$6, 
          is_placed=$7, graduation_year=$8, updated_at=CURRENT_TIMESTAMP
        WHERE student_id=$9`,
        [cgpa, eligibility_status, companies_applied, current_status, offer_count, package_offered, is_placed ? 1 : 0, graduation_year, sid]
      );
    } else {
      await pool.query(
        `INSERT INTO student_placements 
          (student_id, cgpa, eligibility_status, companies_applied, current_status, offer_count, package_offered, is_placed, graduation_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [sid, cgpa, eligibility_status, companies_applied, current_status, offer_count, package_offered, is_placed ? 1 : 0, graduation_year]
      );
    }

    const result = await pool.query("SELECT * FROM student_placements WHERE student_id=$1", [sid]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update placement error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Company Drives APIs =====
app.get("/company-drives/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const result = await pool.query(
      "SELECT * FROM company_drives WHERE college_id = $1 ORDER BY drive_date DESC",
      [collegeId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch drives error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/company-drives", async (req, res) => {
  try {
    const { company_name, job_role, package_offered, drive_date, drive_mode, eligibility_criteria, college_id } = req.body;

    const result = await pool.query(
      `INSERT INTO company_drives 
      (company_name, job_role, package_offered, drive_date, drive_mode, eligibility_criteria, college_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [company_name, job_role, package_offered, drive_date, drive_mode, eligibility_criteria, college_id]
    );

    const inserted = await pool.query("SELECT * FROM company_drives WHERE id=$1", [result.lastID]);
    res.json(inserted.rows[0]);
  } catch (err) {
    console.error("Create drive error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/company-drives/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { drive_status, students_applied, students_shortlisted, students_selected } = req.body;

    await pool.query(
      `UPDATE company_drives 
      SET drive_status = $1, students_applied = $2, students_shortlisted = $3, 
          students_selected = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5`,
      [drive_status, students_applied, students_shortlisted, students_selected, id]
    );

    const result = await pool.query("SELECT * FROM company_drives WHERE id=$1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update drive error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Offer Letter Verification APIs =====
app.get("/offer-letters/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const collegeResult = await pool.query("SELECT college FROM profile WHERE id=$1", [collegeId]);
    const collegeName = collegeResult.rows[0]?.college;

    let query = `
      SELECT ol.*, p.name as student_name, p.department
      FROM offer_letters ol
      JOIN profile p ON ol.student_id = p.id
    `;
    let params = [];
    if (collegeName) {
      query += " WHERE p.college = $1";
      params = [collegeName];
    }
    query += " ORDER BY ol.created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch offers error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/offer-letters/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status, verified_by, rejection_reason } = req.body;

    await pool.query(
      `UPDATE offer_letters 
      SET verification_status = $1, verified_by = $2, rejection_reason = $3, 
          verification_date = CURRENT_TIMESTAMP
      WHERE id = $4`,
      [verification_status, verified_by, rejection_reason, id]
    );

    const result = await pool.query("SELECT * FROM offer_letters WHERE id=$1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Verify offer error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Internship Tracking APIs =====
app.get("/internships/:collegeId", async (req, res) => {
  try {
    const { collegeId } = req.params;
    const collegeResult = await pool.query("SELECT college FROM profile WHERE id=$1", [collegeId]);
    const collegeName = collegeResult.rows[0]?.college;

    let query = `
      SELECT i.*, p.name as student_name, p.department
      FROM internships i
      JOIN profile p ON i.student_id = p.id
    `;
    let params = [];
    if (collegeName) {
      query += " WHERE p.college = $1";
      params = [collegeName];
    }
    query += " ORDER BY i.start_date DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch internships error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/internships", async (req, res) => {
  try {
    const { student_id, company_name, stipend, start_date, end_date, has_ppo } = req.body;

    const result = await pool.query(
      `INSERT INTO internships 
      (student_id, company_name, stipend, start_date, end_date, has_ppo)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [student_id, company_name, stipend, start_date, end_date, has_ppo ? 1 : 0]
    );

    const inserted = await pool.query("SELECT * FROM internships WHERE id=$1", [result.lastID]);
    res.json(inserted.rows[0]);
  } catch (err) {
    console.error("Create internship error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/internships/:id/ppo", async (req, res) => {
  try {
    const { id } = req.params;
    const { ppo_converted, ppo_package } = req.body;

    await pool.query(
      `UPDATE internships 
      SET ppo_converted = $1, ppo_package = $2
      WHERE id = $3`,
      [ppo_converted ? 1 : 0, ppo_package, id]
    );

    const result = await pool.query("SELECT * FROM internships WHERE id=$1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update PPO error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.send("Hack-2-Hire Backend is running!");
});

// ===== START SERVER =====
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
