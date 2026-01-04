const { ScraperService } = require('./src/services/scraper.service');
const { AIService } = require('./src/services/ai.service');
require('dotenv').config();

// Mock logger
global.logger = {
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.log,
};

async function test() {
    const scraper = new ScraperService();
    const ai = new AIService();
    const url = 'https://google.com';

    console.log(`Testing scraper with: ${url}`);
    try {
        const data = await scraper.scrape(url);
        console.log('Scrape Success:', data.title);

        console.log('Testing AI Verification...');
        const verify = await ai.verifyContent(url, data.title, data.rawHtml.substring(0, 5000));
        console.log('AI Response:', JSON.stringify(verify, null, 2));
    } catch (err) {
        console.error('Scraper Failed:', err);
    }
}

test();
