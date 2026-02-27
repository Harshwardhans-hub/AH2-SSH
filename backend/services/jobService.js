const {
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
} = require('./scraperService');

async function fetchAllJobs() {
    console.log("Fetching jobs from 11+ sources via Web Scraping & APIs...");

    // Use Promise.allSettled so one failure doesn't break the rest
    const results = await Promise.allSettled([
        // LinkedIn - multiple keyword searches
        scrapeLinkedInJobs("Software Engineer", "India"),
        scrapeLinkedInJobs("Software Engineering Internship", "India"),
        scrapeLinkedInJobs("Data Scientist", "India"),
        scrapeLinkedInJobs("Frontend Developer", "India"),
        scrapeLinkedInJobs("Backend Developer", "India"),

        // Company-specific searches
        scrapeGoogleJobs("Software Engineer"),
        scrapeMicrosoftJobs("Engineer"),
        scrapeMetaJobs("Software"),
        scrapeAmazonJobs(),
        scrapeAppleJobs(),
        scrapeFlipkartJobs(),

        // Job board APIs (no scraping needed)
        scrapeRemotiveJobs(),
        scrapeArbeitnowJobs(),
        scrapeFindworkJobs(),

        // Startup / general jobs
        scrapeStartupJobs()
    ]);

    let allJobs = [];
    for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allJobs = allJobs.concat(result.value);
        }
    }

    // De-duplicate by applyLink
    const seen = new Set();
    const uniqueJobs = [];
    for (const job of allJobs) {
        const key = job.applyLink || `${job.title}-${job.company}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueJobs.push(job);
        }
    }

    console.log(`Total jobs fetched: ${allJobs.length}, unique: ${uniqueJobs.length}`);
    return uniqueJobs;
}

module.exports = { fetchAllJobs };
