const axios = require('axios');
let puppeteer, StealthPlugin, cheerio;
try {
    puppeteer = require('puppeteer-extra');
    StealthPlugin = require('puppeteer-extra-plugin-stealth');
    if (puppeteer && StealthPlugin) {
        puppeteer.use(StealthPlugin());
    }
} catch (e) {
    console.warn("[Scraper] Puppeteer not available, using HTTP-only mode:", e.message);
}
try {
    cheerio = require('cheerio');
} catch (e) {
    console.warn("[Scraper] Cheerio not available:", e.message);
}

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
};

// ===== 1. LINKEDIN (HTTP — no login needed for public search) =====
async function scrapeLinkedInJobs(keyword, location) {
    console.log(`[Scraper] LinkedIn HTTP Scraper for: ${keyword} in ${location}...`);
    if (!cheerio) return [];
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&start=0`;

        const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
        const $ = cheerio.load(response.data);
        const jobs = [];

        $('li').each((index, element) => {
            const title = $(element).find('.base-search-card__title').text().trim();
            const company = $(element).find('.base-search-card__subtitle').text().trim();
            const loc = $(element).find('.job-search-card__location').text().trim();
            const applyLink = $(element).find('a.base-card__full-link').attr('href');
            const dateText = $(element).find('time').attr('datetime') || '';

            if (title && applyLink) {
                jobs.push({
                    title,
                    company,
                    location: loc || location,
                    salary: "Competitive",
                    type: keyword.toLowerCase().includes('intern') ? "Internship" : "Full-time",
                    source: 'LinkedIn',
                    applyLink,
                    postedDate: dateText ? new Date(dateText).toISOString() : new Date().toISOString()
                });
            }
        });

        console.log(`[Scraper] Extracted ${jobs.length} jobs from LinkedIn for "${keyword}".`);
        return jobs;
    } catch (error) {
        console.error("[Scraper] LinkedIn HTTP Error:", error.message);
        return [];
    }
}

// ===== 2. REMOTIVE (Remote Jobs API — free, no key needed) =====
async function scrapeRemotiveJobs() {
    console.log("[Scraper] Fetching Remotive remote jobs...");
    try {
        const response = await axios.get("https://remotive.com/api/remote-jobs?limit=30", {
            headers: HEADERS,
            timeout: 15000
        });

        const jobs = [];
        const listings = response.data?.jobs || [];

        for (const job of listings) {
            jobs.push({
                title: job.title || "Remote Role",
                company: job.company_name || "Remote Company",
                location: job.candidate_required_location || "Remote / Worldwide",
                salary: job.salary || "Competitive",
                type: job.job_type || "Full-time",
                source: "Remotive",
                applyLink: job.url || "https://remotive.com",
                postedDate: job.publication_date ? new Date(job.publication_date).toISOString() : new Date().toISOString()
            });
        }

        console.log(`[Scraper] Extracted ${jobs.length} remote jobs from Remotive.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Remotive Error:", e.message);
        return [];
    }
}

// ===== 3. GITHUB JOBS via Arbeitnow (free public API) =====
async function scrapeArbeitnowJobs() {
    console.log("[Scraper] Fetching Arbeitnow jobs...");
    try {
        const response = await axios.get("https://www.arbeitnow.com/api/job-board-api", {
            headers: HEADERS,
            timeout: 15000
        });

        const jobs = [];
        const listings = response.data?.data || [];

        for (const job of listings) {
            jobs.push({
                title: job.title || "Software Role",
                company: job.company_name || "Tech Company",
                location: job.location || "Remote",
                salary: "Competitive",
                type: job.remote ? "Remote" : "On-site",
                source: "Arbeitnow",
                applyLink: job.url || "https://www.arbeitnow.com",
                postedDate: job.created_at ? new Date(job.created_at * 1000).toISOString() : new Date().toISOString()
            });
        }

        console.log(`[Scraper] Extracted ${jobs.length} jobs from Arbeitnow.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Arbeitnow Error:", e.message);
        return [];
    }
}

// ===== 4. FINDWORK.DEV (free public API for dev jobs) =====
async function scrapeFindworkJobs() {
    console.log("[Scraper] Fetching Findwork.dev jobs...");
    try {
        const response = await axios.get("https://findwork.dev/api/jobs/", {
            headers: { ...HEADERS, 'Accept': 'application/json' },
            timeout: 15000
        });

        const jobs = [];
        const results = response.data?.results || [];

        for (const job of results) {
            jobs.push({
                title: job.role || "Developer Role",
                company: job.company_name || "Tech Company",
                location: job.location || "Remote",
                salary: "Competitive",
                type: job.employment_type || "Full-time",
                source: "Findwork",
                applyLink: job.url || "https://findwork.dev",
                postedDate: job.date_posted ? new Date(job.date_posted).toISOString() : new Date().toISOString()
            });
        }

        console.log(`[Scraper] Extracted ${jobs.length} jobs from Findwork.dev.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Findwork Error:", e.message);
        return [];
    }
}

// ===== 5. GOOGLE CAREERS (via LinkedIn public search) =====
async function scrapeGoogleJobs(keyword) {
    console.log(`[Scraper] Fetching Google jobs via LinkedIn for: ${keyword}...`);
    if (!cheerio) return [];
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keyword + ' Google')}&location=India&start=0`;

        const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
        const $ = cheerio.load(response.data);
        const jobs = [];

        $('li').each((index, element) => {
            const title = $(element).find('.base-search-card__title').text().trim();
            const company = $(element).find('.base-search-card__subtitle').text().trim();
            const loc = $(element).find('.job-search-card__location').text().trim();
            const applyLink = $(element).find('a.base-card__full-link').attr('href');
            const dateText = $(element).find('time').attr('datetime') || '';

            if (title && applyLink && company.toLowerCase().includes('google')) {
                jobs.push({
                    title,
                    company,
                    location: loc || "India",
                    salary: "Competitive",
                    type: "Full-time",
                    source: "Google Careers",
                    applyLink,
                    postedDate: dateText ? new Date(dateText).toISOString() : new Date().toISOString()
                });
            }
        });

        console.log(`[Scraper] Extracted ${jobs.length} Google jobs.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Google Jobs Error:", e.message);
        return [];
    }
}

// ===== 6. MICROSOFT CAREERS (via LinkedIn public search) =====
async function scrapeMicrosoftJobs(keyword) {
    console.log(`[Scraper] Fetching Microsoft jobs via LinkedIn for: ${keyword}...`);
    if (!cheerio) return [];
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keyword + ' Microsoft')}&location=India&start=0`;

        const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
        const $ = cheerio.load(response.data);
        const jobs = [];

        $('li').each((index, element) => {
            const title = $(element).find('.base-search-card__title').text().trim();
            const company = $(element).find('.base-search-card__subtitle').text().trim();
            const loc = $(element).find('.job-search-card__location').text().trim();
            const applyLink = $(element).find('a.base-card__full-link').attr('href');
            const dateText = $(element).find('time').attr('datetime') || '';

            if (title && applyLink && company.toLowerCase().includes('microsoft')) {
                jobs.push({
                    title,
                    company,
                    location: loc || "India",
                    salary: "Competitive",
                    type: "Full-time",
                    source: "Microsoft Careers",
                    applyLink,
                    postedDate: dateText ? new Date(dateText).toISOString() : new Date().toISOString()
                });
            }
        });

        console.log(`[Scraper] Extracted ${jobs.length} Microsoft jobs.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Microsoft Jobs Error:", e.message);
        return [];
    }
}

// ===== 7. META CAREERS (via LinkedIn public search) =====
async function scrapeMetaJobs(keyword) {
    console.log(`[Scraper] Fetching Meta jobs via LinkedIn for: ${keyword}...`);
    if (!cheerio) return [];
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keyword + ' Meta')}&location=India&start=0`;

        const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
        const $ = cheerio.load(response.data);
        const jobs = [];

        $('li').each((index, element) => {
            const title = $(element).find('.base-search-card__title').text().trim();
            const company = $(element).find('.base-search-card__subtitle').text().trim();
            const loc = $(element).find('.job-search-card__location').text().trim();
            const applyLink = $(element).find('a.base-card__full-link').attr('href');
            const dateText = $(element).find('time').attr('datetime') || '';

            if (title && applyLink && (company.toLowerCase().includes('meta') || company.toLowerCase().includes('facebook'))) {
                jobs.push({
                    title,
                    company,
                    location: loc || "India",
                    salary: "Competitive",
                    type: "Full-time",
                    source: "Meta Careers",
                    applyLink,
                    postedDate: dateText ? new Date(dateText).toISOString() : new Date().toISOString()
                });
            }
        });

        console.log(`[Scraper] Extracted ${jobs.length} Meta jobs.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Meta Jobs Error:", e.message);
        return [];
    }
}

// ===== 8. AMAZON CAREERS (via LinkedIn public search) =====
async function scrapeAmazonJobs() {
    console.log("[Scraper] Fetching Amazon jobs via LinkedIn...");
    if (!cheerio) return [];
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent('Software Engineer Amazon')}&location=India&start=0`;

        const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
        const $ = cheerio.load(response.data);
        const jobs = [];

        $('li').each((index, element) => {
            const title = $(element).find('.base-search-card__title').text().trim();
            const company = $(element).find('.base-search-card__subtitle').text().trim();
            const loc = $(element).find('.job-search-card__location').text().trim();
            const applyLink = $(element).find('a.base-card__full-link').attr('href');
            const dateText = $(element).find('time').attr('datetime') || '';

            if (title && applyLink && company.toLowerCase().includes('amazon')) {
                jobs.push({
                    title,
                    company,
                    location: loc || "India",
                    salary: "Competitive",
                    type: "Full-time",
                    source: "Amazon Careers",
                    applyLink,
                    postedDate: dateText ? new Date(dateText).toISOString() : new Date().toISOString()
                });
            }
        });

        console.log(`[Scraper] Extracted ${jobs.length} Amazon jobs.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Amazon Jobs Error:", e.message);
        return [];
    }
}

// ===== 9. APPLE CAREERS (via LinkedIn public search) =====
async function scrapeAppleJobs() {
    console.log("[Scraper] Fetching Apple jobs via LinkedIn...");
    if (!cheerio) return [];
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent('Software Engineer Apple')}&location=India&start=0`;

        const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
        const $ = cheerio.load(response.data);
        const jobs = [];

        $('li').each((index, element) => {
            const title = $(element).find('.base-search-card__title').text().trim();
            const company = $(element).find('.base-search-card__subtitle').text().trim();
            const loc = $(element).find('.job-search-card__location').text().trim();
            const applyLink = $(element).find('a.base-card__full-link').attr('href');
            const dateText = $(element).find('time').attr('datetime') || '';

            if (title && applyLink && company.toLowerCase().includes('apple')) {
                jobs.push({
                    title,
                    company,
                    location: loc || "India",
                    salary: "Competitive",
                    type: "Full-time",
                    source: "Apple Careers",
                    applyLink,
                    postedDate: dateText ? new Date(dateText).toISOString() : new Date().toISOString()
                });
            }
        });

        console.log(`[Scraper] Extracted ${jobs.length} Apple jobs.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Apple Jobs Error:", e.message);
        return [];
    }
}

// ===== 10. FLIPKART / WALMART CAREERS (via LinkedIn search) =====
async function scrapeFlipkartJobs() {
    console.log("[Scraper] Fetching Flipkart/Walmart jobs via LinkedIn...");
    if (!cheerio) return [];
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent('Software Engineer Flipkart OR Walmart')}&location=India&start=0`;

        const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
        const $ = cheerio.load(response.data);
        const jobs = [];

        $('li').each((index, element) => {
            const title = $(element).find('.base-search-card__title').text().trim();
            const company = $(element).find('.base-search-card__subtitle').text().trim();
            const loc = $(element).find('.job-search-card__location').text().trim();
            const applyLink = $(element).find('a.base-card__full-link').attr('href');
            const dateText = $(element).find('time').attr('datetime') || '';

            if (title && applyLink && (company.toLowerCase().includes('flipkart') || company.toLowerCase().includes('walmart'))) {
                jobs.push({
                    title,
                    company,
                    location: loc || "India",
                    salary: "Competitive",
                    type: "Full-time",
                    source: company.toLowerCase().includes('flipkart') ? "Flipkart Careers" : "Walmart Careers",
                    applyLink,
                    postedDate: dateText ? new Date(dateText).toISOString() : new Date().toISOString()
                });
            }
        });

        console.log(`[Scraper] Extracted ${jobs.length} Flipkart/Walmart jobs.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Flipkart Jobs Error:", e.message);
        return [];
    }
}

// ===== 11. GLASSDOOR EQUIVALENT (via LinkedIn search for startups) =====
async function scrapeStartupJobs() {
    console.log("[Scraper] Fetching Startup/Glassdoor-equivalent jobs...");
    if (!cheerio) return [];
    try {
        const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent('Software Developer startup')}&location=India&start=0`;

        const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
        const $ = cheerio.load(response.data);
        const jobs = [];

        $('li').each((index, element) => {
            const title = $(element).find('.base-search-card__title').text().trim();
            const company = $(element).find('.base-search-card__subtitle').text().trim();
            const loc = $(element).find('.job-search-card__location').text().trim();
            const applyLink = $(element).find('a.base-card__full-link').attr('href');
            const dateText = $(element).find('time').attr('datetime') || '';

            if (title && applyLink) {
                jobs.push({
                    title,
                    company,
                    location: loc || "India",
                    salary: "Competitive",
                    type: "Full-time",
                    source: "Startups",
                    applyLink,
                    postedDate: dateText ? new Date(dateText).toISOString() : new Date().toISOString()
                });
            }
        });

        console.log(`[Scraper] Extracted ${jobs.length} startup jobs.`);
        return jobs;
    } catch (e) {
        console.error("[Scraper] Startup Jobs Error:", e.message);
        return [];
    }
}

module.exports = {
    scrapeLinkedInJobs,
    scrapeRemotiveJobs,
    scrapeArbeitnowJobs,
    scrapeFindworkJobs,
    scrapeGoogleJobs,
    scrapeMicrosoftJobs,
    scrapeMetaJobs,
    scrapeAmazonJobs,
    scrapeAppleJobs,
    scrapeFlipkartJobs,
    scrapeStartupJobs
};
