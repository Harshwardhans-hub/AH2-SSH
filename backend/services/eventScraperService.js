const axios = require('axios');
let cheerio;
try {
    cheerio = require('cheerio');
} catch (e) {
    console.warn("[EventScraper] cheerio not available:", e.message);
}

// ===== DEVFOLIO SCRAPER =====
async function scrapeDevfolioEvents() {
    console.log("[EventScraper] Scraping Devfolio hackathons...");
    try {
        // Devfolio uses a GraphQL-ish POST endpoint
        const response = await axios.post("https://api.devfolio.co/api/search/hackathons", {
            type: "upcoming",
            from: 0,
            size: 15
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        const events = [];
        const hits = response.data?.hits?.hits || response.data?.hits || [];
        const hitsArray = Array.isArray(hits) ? hits : [];

        for (const hit of hitsArray) {
            const h = hit._source || hit;
            events.push({
                title: h.name || "Devfolio Hackathon",
                organizer: h.org_name || "Devfolio Community",
                date: h.starts_at ? new Date(h.starts_at).toDateString() : new Date().toDateString(),
                endDate: h.ends_at ? new Date(h.ends_at).toDateString() : null,
                description: h.desc || h.tagline || "A hackathon hosted on Devfolio.",
                link: h.hackathon_slug ? `https://devfolio.co/hackathons/${h.hackathon_slug}` : "https://devfolio.co",
                location: h.is_online ? "Online" : (h.city || "India"),
                type: "Hackathon",
                source: "Devfolio"
            });
        }

        console.log(`[EventScraper] Extracted ${events.length} events from Devfolio.`);
        return events;
    } catch (e) {
        console.error("[EventScraper] Devfolio scraping error:", e.message);
        return [];
    }
}

// ===== UNSTOP (formerly D2C) SCRAPER ===== 
async function scrapeUnstopEvents() {
    console.log("[EventScraper] Scraping Unstop hackathons & competitions...");
    try {
        const response = await axios.get("https://unstop.com/api/public/opportunity/search-new", {
            params: {
                opportunity: "hackathons",
                per_page: 15,
                oppstatus: "open"
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        const events = [];
        const data = response.data?.data?.data || response.data?.data || [];

        if (Array.isArray(data)) {
            for (const item of data) {
                events.push({
                    title: item.title || item.name || "Unstop Competition",
                    organizer: item.organisation?.name || item.organiser_name || "Unstop",
                    date: item.start_date ? new Date(item.start_date).toDateString() : new Date().toDateString(),
                    endDate: item.end_date ? new Date(item.end_date).toDateString() : null,
                    description: item.seo_details?.desc || item.subtitle || "Competition hosted on Unstop.",
                    link: item.public_url ? `https://unstop.com${item.public_url.startsWith('/') ? '' : '/'}${item.public_url}` : "https://unstop.com",
                    location: item.festival_city || (item.is_online ? "Online" : "India"),
                    type: item.type || "Hackathon",
                    source: "Unstop"
                });
            }
        }

        console.log(`[EventScraper] Extracted ${events.length} events from Unstop.`);
        return events;
    } catch (e) {
        console.error("[EventScraper] Unstop scraping error:", e.message);
        return [];
    }
}

// ===== DEVPOST SCRAPER =====
async function scrapeDevpostEvents() {
    console.log("[EventScraper] Scraping Devpost hackathons...");
    if (!cheerio) return [];
    try {
        const response = await axios.get("https://devpost.com/hackathons?status[]=upcoming&status[]=open", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept': 'text/html'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const events = [];

        $('.hackathon-tile').each((index, el) => {
            const title = $(el).find('.content h2').text().trim() || $(el).find('h2').text().trim();
            const organizer = $(el).find('.host-label').text().trim() || "Devpost";
            const dateText = $(el).find('.submission-period').text().trim() || "";
            const desc = $(el).find('.tagline').text().trim() || "Hackathon on Devpost.";
            const link = $(el).find('a.link-to-hackathon').attr('href') || $(el).find('a').attr('href') || "https://devpost.com";
            const locationText = $(el).find('.info-with-icon .location').text().trim() || "Online";

            if (title) {
                events.push({
                    title,
                    organizer,
                    date: dateText || new Date().toDateString(),
                    endDate: null,
                    description: desc,
                    link: link.startsWith('http') ? link : `https://devpost.com${link}`,
                    location: locationText,
                    type: "Hackathon",
                    source: "Devpost"
                });
            }
        });

        console.log(`[EventScraper] Extracted ${events.length} events from Devpost.`);
        return events.slice(0, 10);
    } catch (e) {
        console.error("[EventScraper] Devpost scraping error:", e.message);
        return [];
    }
}

// ===== EVENTBRITE TECH EVENTS SCRAPER =====
async function scrapeEventbriteEvents() {
    console.log("[EventScraper] Scraping Eventbrite tech events...");
    if (!cheerio) return [];
    try {
        const response = await axios.get("https://www.eventbrite.com/d/online/hackathon/", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept': 'text/html'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const events = [];

        // Eventbrite uses various class structures
        $('div[data-testid="search-event-card"]').each((index, el) => {
            const title = $(el).find('h2').text().trim() || $(el).find('h3').text().trim();
            const dateText = $(el).find('p').first().text().trim();
            const link = $(el).find('a').first().attr('href') || "https://www.eventbrite.com";
            const organizer = $(el).find('[data-testid="organizer-name"]').text().trim() || "Eventbrite Community";

            if (title) {
                events.push({
                    title,
                    organizer,
                    date: dateText || new Date().toDateString(),
                    endDate: null,
                    description: `Tech event: ${title}`,
                    link: link.startsWith('http') ? link : `https://www.eventbrite.com${link}`,
                    location: "Online",
                    type: "Event",
                    source: "Eventbrite"
                });
            }
        });

        console.log(`[EventScraper] Extracted ${events.length} events from Eventbrite.`);
        return events.slice(0, 10);
    } catch (e) {
        console.error("[EventScraper] Eventbrite scraping error:", e.message);
        return [];
    }
}

// ===== MLH (Major League Hacking) SCRAPER =====
async function scrapeMLHEvents() {
    console.log("[EventScraper] Scraping MLH hackathons...");
    if (!cheerio) return [];
    try {
        const response = await axios.get("https://mlh.io/seasons/2026/events", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept': 'text/html'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const events = [];

        $('.event-wrapper .event').each((index, el) => {
            const title = $(el).find('.event-name').text().trim() || $(el).find('h3').text().trim();
            const dateText = $(el).find('.event-date').text().trim();
            const link = $(el).find('a.event-link').attr('href') || $(el).find('a').first().attr('href') || "https://mlh.io";
            const locationText = $(el).find('.event-location').text().trim() || "TBD";
            const imageUrl = $(el).find('img').attr('src') || "";

            if (title) {
                events.push({
                    title,
                    organizer: "Major League Hacking (MLH)",
                    date: dateText || new Date().toDateString(),
                    endDate: null,
                    description: `MLH hackathon: ${title}`,
                    link: link.startsWith('http') ? link : `https://mlh.io${link}`,
                    location: locationText,
                    type: "Hackathon",
                    source: "MLH"
                });
            }
        });

        console.log(`[EventScraper] Extracted ${events.length} events from MLH.`);
        return events.slice(0, 10);
    } catch (e) {
        console.error("[EventScraper] MLH scraping error:", e.message);
        return [];
    }
}

// ===== AGGREGATE ALL EVENTS =====
async function fetchAllEvents() {
    console.log("[EventScraper] Fetching events from all sources...");
    try {
        const results = await Promise.allSettled([
            scrapeDevfolioEvents(),
            scrapeUnstopEvents(),
            scrapeDevpostEvents(),
            scrapeEventbriteEvents(),
            scrapeMLHEvents()
        ]);

        let allEvents = [];
        for (const result of results) {
            if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                allEvents = allEvents.concat(result.value);
            }
        }

        // Assign unique IDs
        allEvents = allEvents.map((event, index) => ({
            ...event,
            id: `evt_${Date.now()}_${index}`
        }));

        console.log(`[EventScraper] Total events aggregated: ${allEvents.length}`);
        return allEvents;
    } catch (err) {
        console.error("[EventScraper] Aggregate fetch error:", err.message);
        return [];
    }
}

module.exports = { fetchAllEvents, scrapeDevfolioEvents, scrapeUnstopEvents, scrapeDevpostEvents, scrapeEventbriteEvents, scrapeMLHEvents };
