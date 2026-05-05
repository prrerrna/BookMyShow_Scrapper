require("dotenv").config();
const { cities } = require("./config/cities");
const { upsertEvents, readEvents, refreshExpiry } = require("./db/supabase");
const { scrapeBookMyShow } = require("./scraper/bookmyshow");
const { syncToSheets } = require("./sheets/sync");

const scrapeCity = async (city) => {
  try {
    console.log(`[${city}] Starting scrape...`);
    const scraped = await scrapeBookMyShow(city, Number(process.env.SCRAPE_TIMEOUT_MS || 60000));
    
    console.log(`[${city}] Upserting ${scraped.length} events to Supabase...`);
    await upsertEvents(scraped);
    console.log(`[${city}] Done.`);
  } catch (err) {
    console.error(`[${city}] Scrape failed:`, err.message);
  }
};

(async () => {
  console.log("🚀 Starting BookMyShow Scraper...");
  
  // 1. Refresh expiry statuses
  await refreshExpiry();
  
  // 2. Scrape all cities sequentially
  for (const city of cities) {
    await scrapeCity(city);
  }
  
  // 3. Sync everything to Google Sheets
  try {
    console.log("📊 Syncing all data to Google Sheets...");
    const allEvents = await readEvents();
    await syncToSheets(allEvents);
    console.log("✅ Sync complete.");
  } catch(err) {
    console.error("❌ Sheets sync failed:", err.message);
  }
  
  console.log("🎉 Run completed successfully.");
  process.exit(0);
})();
