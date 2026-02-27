const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Try to load HuggingFace — optional for the enhanced analysis
let HfInference;
try {
    HfInference = require('@huggingface/inference').HfInference;
} catch (e) {
    console.warn("[ResumeService] @huggingface/inference not available — using local analysis only.");
}

async function extractTextFromPDF(buffer) {
    try {
        const data = await pdf(buffer);
        return data.text.replace(/\n\s*\n/g, '\n').trim();
    } catch (error) {
        console.error("Error extracting text from PDF:", error.message);
        throw new Error("Failed to parse PDF file.");
    }
}

async function extractTextFromDOCX(buffer) {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value.replace(/\n\s*\n/g, '\n').trim();
    } catch (error) {
        console.error("Error extracting text from DOCX:", error.message);
        throw new Error("Failed to parse DOCX file.");
    }
}

// ===== KEYWORD DATABASE =====
const TECH_KEYWORDS = {
    languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'sql', 'html', 'css', 'sass', 'less', 'dart', 'perl', 'shell', 'bash', 'powershell', 'matlab', 'objective-c'],
    frameworks: ['react', 'reactjs', 'react.js', 'angular', 'vue', 'vuejs', 'vue.js', 'next.js', 'nextjs', 'nuxt', 'express', 'expressjs', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'springboot', 'rails', 'ruby on rails', 'laravel', '.net', 'dotnet', 'asp.net', 'svelte', 'gatsby', 'ember', 'backbone', 'flutter', 'react native', 'electron', 'nest.js', 'nestjs', 'fastify', 'hapi'],
    databases: ['mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'sql server', 'dynamodb', 'cassandra', 'firebase', 'firestore', 'supabase', 'neo4j', 'couchdb', 'mariadb', 'cockroachdb'],
    cloud: ['aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean', 'cloudflare', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'github actions', 'gitlab ci', 'circleci', 'travis'],
    tools: ['git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'postman', 'swagger', 'webpack', 'vite', 'babel', 'npm', 'yarn', 'pnpm', 'pip', 'maven', 'gradle', 'cmake', 'make', 'linux', 'unix', 'vim', 'vs code'],
    concepts: ['rest', 'restful', 'graphql', 'grpc', 'websocket', 'api', 'microservices', 'monolith', 'serverless', 'oop', 'object oriented', 'functional programming', 'tdd', 'bdd', 'agile', 'scrum', 'kanban', 'ci/cd', 'devops', 'sre', 'machine learning', 'deep learning', 'neural network', 'nlp', 'natural language', 'computer vision', 'data science', 'data engineering', 'etl', 'data pipeline', 'blockchain', 'web3', 'cybersecurity', 'penetration testing'],
    soft: ['leadership', 'teamwork', 'communication', 'problem solving', 'problem-solving', 'analytical', 'critical thinking', 'time management', 'collaboration', 'mentoring', 'mentorship', 'presentation', 'public speaking']
};

const RESUME_SECTIONS = ['education', 'experience', 'work experience', 'skills', 'projects', 'certifications', 'achievements', 'awards', 'publications', 'summary', 'objective', 'professional summary', 'work history', 'employment', 'technical skills', 'extracurricular', 'volunteer', 'interests', 'hobbies', 'languages', 'references'];

const CONTACT_PATTERNS = {
    email: /[\w.-]+@[\w.-]+\.\w+/i,
    phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
    linkedin: /linkedin\.com\/in\//i,
    github: /github\.com\//i,
    website: /https?:\/\/[\w.-]+\.\w+/i
};

// ===== EXTRACT KEYWORDS FROM TEXT =====
function extractKeywords(text) {
    const lower = text.toLowerCase();
    const found = {
        languages: [],
        frameworks: [],
        databases: [],
        cloud: [],
        tools: [],
        concepts: [],
        soft: []
    };

    for (const [category, keywords] of Object.entries(TECH_KEYWORDS)) {
        for (const kw of keywords) {
            // Use word boundary matching for short keywords
            const pattern = kw.length <= 3
                ? new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
                : new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            if (pattern.test(lower)) {
                found[category].push(kw);
            }
        }
    }

    return found;
}

// ===== SECTION DETECTION =====
function detectSections(text) {
    const lower = text.toLowerCase();
    const detected = [];
    const missing = [];

    const critical = ['education', 'experience', 'skills', 'projects'];
    const optional = ['certifications', 'achievements', 'summary', 'objective', 'professional summary'];

    for (const section of RESUME_SECTIONS) {
        const pattern = new RegExp(`(^|\\n)\\s*${section}\\s*(:|\\n|$)`, 'im');
        if (pattern.test(lower)) {
            detected.push(section);
        }
    }

    for (const section of critical) {
        if (!detected.some(d => d.includes(section))) {
            missing.push(section);
        }
    }

    return { detected, missing };
}

// ===== CONTACT INFO CHECK =====
function checkContactInfo(text) {
    const found = {};
    for (const [type, pattern] of Object.entries(CONTACT_PATTERNS)) {
        found[type] = pattern.test(text);
    }
    return found;
}

// ===== FORMATTING ANALYSIS =====
function analyzeFormatting(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const bulletCount = (text.match(/[•●▪◆►→\-\*]/g) || []).length;
    const numberMetrics = (text.match(/\d+[%+xX]|\d{2,}/g) || []).length;

    return {
        wordCount,
        lineCount: lines.length,
        bulletPoints: bulletCount,
        quantifiedResults: numberMetrics,
        tooShort: wordCount < 150,
        tooLong: wordCount > 1200,
        hasBullets: bulletCount >= 3,
        hasMetrics: numberMetrics >= 2,
        estimatedPages: Math.ceil(wordCount / 400)
    };
}

// ===== COMPUTE DETAILED ATS SCORE =====
function computeATSAnalysis(resumeText, jobDescription) {
    const resumeKeywords = extractKeywords(resumeText);
    const jdKeywords = extractKeywords(jobDescription);
    const sections = detectSections(resumeText);
    const contact = checkContactInfo(resumeText);
    const formatting = analyzeFormatting(resumeText);

    // 1. Keyword Match Score (40% weight)
    let jdAllKeywords = [];
    let matchedKeywords = [];
    let missingKeywords = [];

    for (const category of Object.keys(TECH_KEYWORDS)) {
        for (const kw of jdKeywords[category]) {
            jdAllKeywords.push(kw);
            if (resumeKeywords[category].includes(kw)) {
                matchedKeywords.push(kw);
            } else {
                missingKeywords.push(kw);
            }
        }
    }

    const keywordScore = jdAllKeywords.length > 0
        ? Math.round((matchedKeywords.length / jdAllKeywords.length) * 100)
        : 50; // neutral if no keywords found

    // 2. Section Score (20% weight)
    const criticalSections = ['education', 'experience', 'skills'];
    const criticalFound = criticalSections.filter(s =>
        sections.detected.some(d => d.includes(s))
    ).length;
    const sectionScore = Math.round((criticalFound / criticalSections.length) * 100);

    // 3. Formatting Score (15% weight)
    let formatScore = 50;
    if (formatting.hasBullets) formatScore += 15;
    if (formatting.hasMetrics) formatScore += 15;
    if (!formatting.tooShort && !formatting.tooLong) formatScore += 10;
    if (formatting.wordCount >= 200) formatScore += 10;
    formatScore = Math.min(100, formatScore);

    // 4. Contact Score (10% weight)
    const contactItems = Object.values(contact);
    const contactFound = contactItems.filter(Boolean).length;
    const contactScore = Math.round((contactFound / contactItems.length) * 100);

    // 5. Relevance Score via text overlap (15% weight)
    const resumeWords = new Set(resumeText.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const jdWords = jobDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const overlapCount = jdWords.filter(w => resumeWords.has(w)).length;
    const relevanceScore = Math.min(100, Math.round((overlapCount / Math.max(jdWords.length, 1)) * 100));

    // Weighted total
    const totalScore = Math.round(
        keywordScore * 0.40 +
        sectionScore * 0.20 +
        formatScore * 0.15 +
        contactScore * 0.10 +
        relevanceScore * 0.15
    );

    // Decision
    let decision;
    if (totalScore >= 75) decision = "Strong Match";
    else if (totalScore >= 60) decision = "Good Match";
    else if (totalScore >= 45) decision = "Partial Match";
    else decision = "Needs Improvement";

    // Generate improvement suggestions
    const improvements = [];
    if (missingKeywords.length > 0) {
        improvements.push(`Add these missing keywords from the JD: ${missingKeywords.slice(0, 8).join(', ')}`);
    }
    if (sections.missing.length > 0) {
        improvements.push(`Add missing sections: ${sections.missing.join(', ')}`);
    }
    if (!formatting.hasBullets) {
        improvements.push("Use bullet points (•) to make your experience easier to scan");
    }
    if (!formatting.hasMetrics) {
        improvements.push("Quantify your achievements with numbers (e.g., 'Improved performance by 40%')");
    }
    if (formatting.tooShort) {
        improvements.push("Your resume is too short. Add more details about your experience and projects");
    }
    if (formatting.tooLong) {
        improvements.push("Your resume may be too long. Keep it concise — ideally 1-2 pages");
    }
    if (!contact.email) {
        improvements.push("Add your email address for contact");
    }
    if (!contact.linkedin) {
        improvements.push("Add your LinkedIn profile URL");
    }
    if (!contact.github) {
        improvements.push("Consider adding your GitHub profile for technical roles");
    }
    if (keywordScore < 50) {
        improvements.push("Tailor your resume more closely to the job description — mirror the exact language used");
    }

    // Category breakdown
    const breakdown = {
        keywordMatch: {
            score: keywordScore,
            weight: "40%",
            label: "Keyword Match",
            detail: `${matchedKeywords.length}/${jdAllKeywords.length} keywords matched`
        },
        sections: {
            score: sectionScore,
            weight: "20%",
            label: "Resume Structure",
            detail: `${sections.detected.length} sections detected, ${sections.missing.length} critical missing`
        },
        formatting: {
            score: formatScore,
            weight: "15%",
            label: "Formatting & Readability",
            detail: `${formatting.bulletPoints} bullet points, ${formatting.quantifiedResults} metrics, ~${formatting.estimatedPages} page(s)`
        },
        contact: {
            score: contactScore,
            weight: "10%",
            label: "Contact Information",
            detail: `${contactFound}/5 contact items found`
        },
        relevance: {
            score: relevanceScore,
            weight: "15%",
            label: "Content Relevance",
            detail: `${overlapCount}/${jdWords.length} JD terms found in resume`
        }
    };

    return {
        score: totalScore,
        decision,
        breakdown,
        matchedKeywords: [...new Set(matchedKeywords)],
        missingKeywords: [...new Set(missingKeywords)].slice(0, 12),
        sectionsDetected: sections.detected,
        sectionsMissing: sections.missing,
        contactInfo: contact,
        formatting: {
            wordCount: formatting.wordCount,
            pages: formatting.estimatedPages,
            bullets: formatting.bulletPoints,
            metrics: formatting.quantifiedResults
        },
        improvements: improvements.slice(0, 6),
        feedback: totalScore >= 75
            ? "Excellent! Your resume is well-aligned with this job description. Focus on fine-tuning specific keywords."
            : totalScore >= 60
                ? "Good foundation! Your resume covers many requirements. Address the missing keywords and suggestions below to boost your score."
                : totalScore >= 45
                    ? "Your resume partially matches this role. Significant improvements are needed — focus on adding relevant skills and restructuring sections."
                    : "Your resume needs major improvements to match this role. Consider rewriting it to closely mirror the job description's requirements."
    };
}

// ===== MAIN ANALYSIS FUNCTION =====
async function analyzeResumeWithAI(resumeText, jobDescription) {
    // Always perform detailed local ATS analysis
    const atsResult = computeATSAnalysis(resumeText, jobDescription);

    // Optionally enhance with HuggingFace AI similarity
    const hfToken = process.env.HF_ACCESS_TOKEN;
    if (hfToken && hfToken !== "INSERT_HF_TOKEN_HERE" && HfInference) {
        try {
            const hf = new HfInference(hfToken);
            const response = await hf.featureExtraction({
                model: 'sentence-transformers/all-MiniLM-L6-v2',
                inputs: [resumeText.substring(0, 2000), jobDescription.substring(0, 2000)],
            });

            const [resumeVec, jdVec] = response;
            let dotProduct = 0, normA = 0, normB = 0;
            for (let i = 0; i < resumeVec.length; i++) {
                dotProduct += resumeVec[i] * jdVec[i];
                normA += resumeVec[i] * resumeVec[i];
                normB += jdVec[i] * jdVec[i];
            }
            const similarity = (normA > 0 && normB > 0) ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
            const aiScore = Math.round(similarity * 100);

            // Blend: 70% local ATS, 30% AI semantic similarity
            atsResult.aiSemanticScore = aiScore;
            atsResult.score = Math.round(atsResult.score * 0.7 + aiScore * 0.3);
            atsResult.aiPowered = true;
        } catch (err) {
            console.warn("[ResumeService] HuggingFace AI enhancement failed:", err.message);
            atsResult.aiPowered = false;
        }
    } else {
        atsResult.aiPowered = false;
    }

    return atsResult;
}

module.exports = { extractTextFromPDF, extractTextFromDOCX, analyzeResumeWithAI };
