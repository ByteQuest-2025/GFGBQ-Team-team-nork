"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scraper_service_1 = require("../src/services/scraper.service");
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('ScraperService', () => {
    let scraperService;
    beforeEach(() => {
        scraperService = new scraper_service_1.ScraperService();
        jest.clearAllMocks();
    });
    it('should scrape title and meta description successfully', async () => {
        // Mock robots.txt
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('robots.txt')) {
                return Promise.resolve({
                    status: 200,
                    data: 'User-agent: *\nAllow: /'
                });
            }
            // Mock page
            return Promise.resolve({
                status: 200,
                data: `
          <html>
            <head>
              <title>Test Page</title>
              <meta name="description" content="This is a test description">
            </head>
            <body>Content</body>
          </html>
        `
            });
        });
        const result = await scraperService.scrape('http://example.com');
        expect(result.title).toBe('Test Page');
        expect(result.metaDescription).toBe('This is a test description');
    });
    it('should throw error if robots.txt disallows', async () => {
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('robots.txt')) {
                return Promise.resolve({
                    status: 200,
                    data: 'User-agent: *\nDisallow: /'
                });
            }
            return Promise.resolve({ status: 200, data: '' });
        });
        await expect(scraperService.scrape('http://example.com/sensitive'))
            .rejects.toThrow('Access denied by robots.txt'); // Check exact error message
    });
});
