import { ScraperService } from './src/services/scraper.service';
import { aiService } from './src/services/ai.service';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
    const scraper = new ScraperService();
    const url = 'https://google.com';

    console.log(`[DIAG] Testing scraper with: ${url}`);
    try {
        const data = await scraper.scrape(url);
        console.log('[DIAG] Scrape Success:', data.title);

        console.log('[DIAG] Testing AI Verification...');
        const verify = await aiService.verifyContent(url, data.title, data.rawHtml.substring(0, 5000));
        console.log('[DIAG] AI Response verdict:', verify?.verdict || 'NULL RESPONSE');
        console.log('[DIAG] AI Response reasoning:', verify?.reasoning || 'NONE');
    } catch (err: any) {
        console.error('[DIAG] Scraper Failed with error:', err.message);
        if (err.stack) console.error(err.stack);
    }
}

test().then(() => console.log('[DIAG] Done.'));
