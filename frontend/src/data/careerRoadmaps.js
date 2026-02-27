// Career Roadmaps data - comprehensive career paths with details
export const careerRoadmaps = {
    "software-developer": {
        title: "Software Developer",
        description: "Build applications and software solutions using modern technologies.",
        skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
        roadmap: [
            "Learn HTML, CSS & JavaScript fundamentals",
            "Master a frontend framework (React/Vue/Angular)",
            "Learn backend development (Node.js/Python/Java)",
            "Understand databases (SQL & NoSQL)",
            "Study system design & software architecture",
            "Build real-world projects & contribute to open source"
        ],
        resources: [
            { name: "FreeCodeCamp", url: "https://www.freecodecamp.org" },
            { name: "The Odin Project", url: "https://www.theodinproject.com" },
            { name: "MDN Web Docs", url: "https://developer.mozilla.org" }
        ]
    },
    "data-scientist": {
        title: "Data Scientist",
        description: "Analyze complex data to help organizations make informed decisions.",
        skills: ["Python", "SQL", "Statistics", "Machine Learning", "TensorFlow", "Pandas"],
        roadmap: [
            "Learn Python programming",
            "Study statistics & probability",
            "Master data manipulation with Pandas & NumPy",
            "Learn data visualization (Matplotlib, Seaborn, Tableau)",
            "Study machine learning algorithms",
            "Work on real datasets & Kaggle competitions"
        ],
        resources: [
            { name: "Kaggle", url: "https://www.kaggle.com/learn" },
            { name: "DataCamp", url: "https://www.datacamp.com" },
            { name: "Fast.ai", url: "https://www.fast.ai" }
        ]
    },
    "ui-ux-designer": {
        title: "UI/UX Designer",
        description: "Design intuitive user interfaces and experiences for web and mobile apps.",
        skills: ["Figma", "Adobe XD", "Design Systems", "User Research", "Prototyping", "Wireframing"],
        roadmap: [
            "Learn design principles & color theory",
            "Master Figma or Adobe XD",
            "Study user research methodologies",
            "Learn wireframing & prototyping",
            "Understand design systems & component libraries",
            "Build a design portfolio with case studies"
        ],
        resources: [
            { name: "Google UX Design Certificate", url: "https://grow.google/uxdesign" },
            { name: "Figma Tutorial", url: "https://www.figma.com/resources/learn-design/" },
            { name: "Nielsen Norman Group", url: "https://www.nngroup.com" }
        ]
    },
    "product-manager": {
        title: "Product Manager",
        description: "Oversee product development, strategy, and execution across teams.",
        skills: ["Agile", "Strategy", "Leadership", "Data Analysis", "Communication", "Roadmapping"],
        roadmap: [
            "Understand product development lifecycle",
            "Learn Agile/Scrum methodologies",
            "Study user research & market analysis",
            "Master product analytics tools",
            "Develop stakeholder communication skills",
            "Build & manage product roadmaps"
        ],
        resources: [
            { name: "Product School", url: "https://www.productschool.com" },
            { name: "Mind the Product", url: "https://www.mindtheproduct.com" },
            { name: "Pragmatic Institute", url: "https://www.pragmaticinstitute.com" }
        ]
    },
    "ai-ml-engineer": {
        title: "AI/ML Engineer",
        description: "Build and deploy intelligent systems using artificial intelligence and machine learning.",
        skills: ["Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP", "Computer Vision"],
        roadmap: [
            "Master Python & mathematics fundamentals",
            "Learn machine learning algorithms",
            "Study deep learning (neural networks, CNNs, RNNs)",
            "Explore NLP or Computer Vision specialization",
            "Learn MLOps & model deployment",
            "Contribute to open-source AI projects"
        ],
        resources: [
            { name: "Andrew Ng's ML Course", url: "https://www.coursera.org/learn/machine-learning" },
            { name: "Hugging Face", url: "https://huggingface.co/learn" },
            { name: "Papers with Code", url: "https://paperswithcode.com" }
        ]
    },
    "devops-engineer": {
        title: "DevOps Engineer",
        description: "Bridge development and operations with automation, CI/CD, and cloud infrastructure.",
        skills: ["Docker", "Kubernetes", "CI/CD", "AWS/Azure/GCP", "Linux", "Terraform"],
        roadmap: [
            "Learn Linux system administration",
            "Master containerization with Docker",
            "Study Kubernetes orchestration",
            "Set up CI/CD pipelines (Jenkins, GitHub Actions)",
            "Learn cloud platforms (AWS/Azure/GCP)",
            "Study Infrastructure as Code (Terraform, Ansible)"
        ],
        resources: [
            { name: "KodeKloud", url: "https://kodekloud.com" },
            { name: "Docker Documentation", url: "https://docs.docker.com" },
            { name: "AWS Free Tier", url: "https://aws.amazon.com/free" }
        ]
    },
    "cybersecurity-analyst": {
        title: "Cybersecurity Analyst",
        description: "Protect systems and data from cyber threats through analysis and security measures.",
        skills: ["Network Security", "Ethical Hacking", "SIEM", "Cryptography", "Penetration Testing", "SOC"],
        roadmap: [
            "Learn networking fundamentals (TCP/IP, DNS, HTTP)",
            "Study operating system security (Linux, Windows)",
            "Master security tools (Wireshark, Metasploit, Burp Suite)",
            "Learn cryptography & encryption",
            "Get certified (CompTIA Security+, CEH)",
            "Practice on CTF platforms (TryHackMe, HackTheBox)"
        ],
        resources: [
            { name: "TryHackMe", url: "https://tryhackme.com" },
            { name: "HackTheBox", url: "https://www.hackthebox.com" },
            { name: "OWASP", url: "https://owasp.org" }
        ]
    },
    "cloud-architect": {
        title: "Cloud Architect",
        description: "Design and manage scalable cloud infrastructure solutions for organizations.",
        skills: ["AWS", "Azure", "GCP", "Cloud Security", "Networking", "Microservices"],
        roadmap: [
            "Learn cloud computing fundamentals",
            "Master one cloud platform (AWS/Azure/GCP)",
            "Study networking & security in cloud",
            "Learn microservices architecture",
            "Get cloud certifications",
            "Design scalable & resilient architectures"
        ],
        resources: [
            { name: "AWS Training", url: "https://aws.amazon.com/training/" },
            { name: "Azure Learn", url: "https://learn.microsoft.com/en-us/azure/" },
            { name: "Google Cloud Training", url: "https://cloud.google.com/training" }
        ]
    },
    "mobile-developer": {
        title: "Mobile App Developer",
        description: "Build native and cross-platform mobile applications for iOS and Android.",
        skills: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "REST APIs"],
        roadmap: [
            "Learn programming fundamentals",
            "Choose native (Swift/Kotlin) or cross-platform (React Native/Flutter)",
            "Master mobile UI design patterns",
            "Learn state management & navigation",
            "Integrate APIs & backend services",
            "Publish apps to App Store / Play Store"
        ],
        resources: [
            { name: "Flutter Dev", url: "https://flutter.dev" },
            { name: "React Native Docs", url: "https://reactnative.dev" },
            { name: "App Academy", url: "https://www.appacademy.io" }
        ]
    },
    "blockchain-developer": {
        title: "Blockchain Developer",
        description: "Build decentralized applications and smart contracts on blockchain platforms.",
        skills: ["Solidity", "Ethereum", "Web3.js", "Smart Contracts", "DeFi", "Rust"],
        roadmap: [
            "Understand blockchain fundamentals & cryptography",
            "Learn Solidity for Ethereum smart contracts",
            "Master Web3.js / Ethers.js for dApp frontend",
            "Study DeFi protocols & tokenomics",
            "Learn security auditing of smart contracts",
            "Build and deploy dApps on testnets"
        ],
        resources: [
            { name: "CryptoZombies", url: "https://cryptozombies.io" },
            { name: "Ethereum Docs", url: "https://ethereum.org/developers" },
            { name: "Solidity by Example", url: "https://solidity-by-example.org" }
        ]
    },
    "full-stack-developer": {
        title: "Full Stack Developer",
        description: "Master both frontend and backend development to build complete web applications.",
        skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "MongoDB", "PostgreSQL"],
        roadmap: [
            "Master HTML, CSS, and JavaScript",
            "Learn React or Angular for frontend",
            "Study Node.js + Express for backend",
            "Master databases (MongoDB + PostgreSQL)",
            "Learn authentication & security",
            "Build and deploy full-stack projects"
        ],
        resources: [
            { name: "Full Stack Open", url: "https://fullstackopen.com" },
            { name: "The Odin Project", url: "https://www.theodinproject.com" },
            { name: "Scrimba", url: "https://scrimba.com" }
        ]
    },
    "game-developer": {
        title: "Game Developer",
        description: "Create interactive games for various platforms using game engines and programming.",
        skills: ["Unity", "Unreal Engine", "C#", "C++", "Game Design", "3D Modeling"],
        roadmap: [
            "Learn programming (C# for Unity, C++ for Unreal)",
            "Master a game engine (Unity or Unreal Engine)",
            "Study game design principles",
            "Learn 2D/3D graphics and animation",
            "Understand physics engines and AI for games",
            "Build and publish game projects"
        ],
        resources: [
            { name: "Unity Learn", url: "https://learn.unity.com" },
            { name: "Unreal Engine Docs", url: "https://docs.unrealengine.com" },
            { name: "GameDev.tv", url: "https://www.gamedev.tv" }
        ]
    }
};
