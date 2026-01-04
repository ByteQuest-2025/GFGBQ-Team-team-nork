import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { VerificationEngine } from './verification.engine';

export class AIService {
    private genAI: GoogleGenerativeAI | null = null;

    constructor() {
        if (config.googleAiApiKey) {
            this.genAI = new GoogleGenerativeAI(config.googleAiApiKey);
        }
    }

    async verifyText(text: string) {
        if (!this.genAI) {
            return VerificationEngine.analyzeText(text);
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const prompt = `
                Analyze the following text for hallucinations, factual inaccuracies, or logical inconsistencies.
                Provide a credibility report.
                
                Text: ${text.substring(0, 10000)}

                Return response in EXACTLY this JSON format:
                {
                    "credibilityScore": number (0-100),
                    "verdict": "Verified" | "Suspicious" | "Highly Unreliable",
                    "reasoning": "Reasoning based on general knowledge",
                    "hallucinationRisk": "Low" | "Medium" | "High"
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            // Check for safety blocking
            if (response.promptFeedback?.blockReason) {
                return VerificationEngine.analyzeText(text); // Safety block? Use internal engine
            }

            const resText = response.text();
            return this.parseAIResponse(resText, text);
        } catch (error: any) {
            logger.warn('AI Text Verification Error, falling back to Heuristic Engine:', error.message);
            return VerificationEngine.analyzeText(text);
        }
    }

    private parseAIResponse(text: string, source: string) {
        logger.debug(`AI Service: Raw response for ${source.substring(0, 50)}: ${text}`);
        const cleanJson = text.replace(/```json|```/g, '').trim();
        try {
            return JSON.parse(cleanJson);
        } catch (parseError) {
            logger.error(`AI Service: Failed to parse JSON. Raw text: ${text}`);
            // If AI is returning nonsense/empty, use heuristic
            return VerificationEngine.analyzeText(source);
        }
    }

    async verifyContent(url: string, title: string, contentSnippet: string) {
        if (!this.genAI) return VerificationEngine.analyze(url, title, contentSnippet);

        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const prompt = `
                You are TruthLens AI, a professional fact-checking system.
                Analyze the following web content snippet and provide a verification report.
                
                URL: ${url}
                Title: ${title}
                Snippet: ${contentSnippet}

                Return response in EXACTLY this JSON format:
                {
                    "credibilityScore": number (0-100),
                    "verdict": "Verified" | "Suspicious" | "Highly Unreliable",
                    "reasoning": "Short explanation",
                    "hallucinationRisk": "Low" | "Medium" | "High"
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            if (response.promptFeedback?.blockReason) {
                return VerificationEngine.analyze(url, title, contentSnippet);
            }

            const text = response.text();
            return this.parseAIResponse(text, url);
        } catch (error: any) {
            logger.warn('AI Content Verification Error, falling back to Heuristic Engine:', error.message);
            return VerificationEngine.analyze(url, title, contentSnippet);
        }
    }
}

export const aiService = new AIService();
