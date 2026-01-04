import axios from 'axios';
import robotsParser from 'robots-parser';
import * as cheerio from 'cheerio';
import { redisClient } from '../config/db';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

const USER_AGENT = 'TruthLensAI-Bot/1.0 (+http://truthlens.ai/bot)';
const STEALTH_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class ScraperService {
    private async getRobotsRules(url: string): Promise<any> {
        const { origin } = new URL(url);
        const robotsUrl = `${origin}/robots.txt`;
        const cacheKey = `robots:${origin}`;

        let robotsTxtContent = '';

        if (redisClient) {
            const cached = await redisClient.get(cacheKey);
            if (cached) return robotsParser(robotsUrl, cached);
        }

        try {
            const response = await axios.get(robotsUrl, {
                timeout: 5000,
                validateStatus: () => true,
                headers: { 'User-Agent': USER_AGENT }
            });
            if (response.status === 200) robotsTxtContent = response.data;
        } catch (err) {
            logger.warn(`Failed to fetch robots.txt for ${origin}`);
        }

        if (redisClient) {
            await redisClient.set(cacheKey, robotsTxtContent, { EX: 86400 });
        }

        return robotsParser(robotsUrl, robotsTxtContent);
    }

    private async checkDisallowed(url: string): Promise<void> {
        const robots = await this.getRobotsRules(url);
        if (!robots.isAllowed(url, USER_AGENT)) {
            throw new AppError('Scraping denied by robots.txt (Standard Mode)', 403);
        }
    }

    public async scrape(url: string, ignoreRobots: boolean = false, stealth: boolean = false): Promise<any> {
        const cacheKey = `scrape:${url}:${stealth ? 'stealth' : 'standard'}`;
        if (redisClient) {
            const cached = await redisClient.get(cacheKey);
            if (cached) return JSON.parse(cached);
        }

        if (!ignoreRobots) {
            await this.checkDisallowed(url);
        }

        const agent = stealth ? STEALTH_USER_AGENT : USER_AGENT;
        const headers: any = { 'User-Agent': agent };

        if (stealth) {
            headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
            headers['Accept-Language'] = 'en-US,en;q=0.5';
            headers['Upgrade-Insecure-Requests'] = '1';
        }

        try {
            const response = await axios.get(url, {
                headers,
                timeout: 15000,
            });

            const $ = cheerio.load(response.data);
            const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled Analysis';
            const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
            const rawHtml = response.data.substring(0, 50000);

            const result = {
                url,
                title,
                metaDescription,
                rawHtml,
                mode: stealth ? 'Stealth' : 'Standard'
            };

            if (redisClient) {
                await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });
            }

            return result;
        } catch (err: any) {
            logger.error(`Scraper Error [${url}] (Stealth: ${stealth}):`, err.message);
            const status = err.response?.status || 500;
            throw new AppError(`Target host responded with status ${status}. ${stealth ? 'Host block persistent.' : 'Retrying in stealth mode...'}`, status);
        }
    }
}
