import { logger } from '../config/logger';

export interface VerificationResult {
    credibilityScore: number;
    verdict: 'Verified' | 'Suspicious' | 'Highly Unreliable';
    reasoning: string;
    hallucinationRisk: 'Low' | 'Medium' | 'High';
    detectedIssues?: string[];
    suggestedCorrection?: string;
}

// Patterns that indicate hallucinations
const EXTREME_CLAIM_PATTERNS = [
    /100\s*%/gi,
    /completely\s+(eliminated|solved|cured)/gi,
    /all\s+(?:cases|patients|doctors|hospitals)/gi,
    /every\s+(?:single|one|doctor|hospital)/gi,
    /has\s+replaced\s+(?:all|every|human)/gi,
    /made\s+.*\s+obsolete/gi,
    /proven\s+(?:beyond|conclusively|definitively)/gi,
    /guaranteed\s+(?:cure|success|results)/gi,
    /outperform.*\s+in\s+100%/gi
];

const FAKE_CITATION_PATTERNS = [
    /\([A-Z][a-z]+\s+et\s+al\.,?\s*\d{4}\)/g,
    /\([A-Z]{2,}\s+Report,?\s*\d{4}\)/g,
    /according\s+to\s+a\s+\d{4}\s+report\s+by\s+[^,\.]+[,\.]/gi,
    /\.\s*A\s+study\s+(?:conducted|published)\s+by[^\.]+\./gi
];

const FAKE_INSTITUTION_PATTERNS = [
    { pattern: /harvard\s+medical\s+university/gi, replacement: 'Harvard Medical School' },
    { pattern: /international\s+institute\s+of\s+[a-z\s]+/gi, replacement: '' },
    { pattern: /global\s+(?:center|institute|foundation)\s+(?:for|of)\s+[a-z\s]+/gi, replacement: '' }
];

const HALLUCINATION_INDICATORS = [
    'miracle cure', 'secret', 'they don\'t want you to know',
    'proven fact', 'undeniable', 'scientists confirm',
    'breaking:', 'exposed', 'cover-up', 'conspiracy',
    'guaranteed', 'revolutionary breakthrough'
];

const TRUSTWORTHY_PATTERNS = [
    /may\s+help/i, /can\s+assist/i, /suggests?\s+that/i,
    /studies\s+(?:indicate|show|suggest)/i,
    /further\s+research\s+(?:is\s+)?needed/i,
    /in\s+controlled\s+(?:studies|trials)/i,
    /depends\s+on/i, /when\s+used\s+alongside/i,
    /complementary/i, /augment.*not\s+replace/i,
    /human\s+oversight/i, /ethical\s+deployment/i
];

// Sentences to remove entirely (too problematic to fix)
const SENTENCES_TO_REMOVE = [
    /[^.]*has\s+completely\s+eliminated[^.]*\./gi,
    /[^.]*outperform\s+doctors\s+in\s+100%[^.]*\./gi,
    /[^.]*has\s+replaced\s+human\s+doctors[^.]*\./gi,
    /[^.]*made\s+.*\s+obsolete[^.]*\./gi,
    /[^.]*legally\s+approved\s+as\s+independent[^.]*\./gi
];

export class VerificationEngine {
    private static cleanText(content: string): string {
        let cleaned = content;

        // Remove entire problematic sentences
        for (const pattern of SENTENCES_TO_REMOVE) {
            cleaned = cleaned.replace(pattern, '');
        }

        // Fix fake institution names
        for (const { pattern, replacement } of FAKE_INSTITUTION_PATTERNS) {
            cleaned = cleaned.replace(pattern, replacement);
        }

        // Remove fake citations
        for (const pattern of FAKE_CITATION_PATTERNS) {
            cleaned = cleaned.replace(pattern, '');
        }

        // Clean up extra spaces and empty lines
        cleaned = cleaned.replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();

        return cleaned;
    }

    public static analyze(url: string, title: string, content: string): VerificationResult {
        logger.info(`Heuristic Engine: Deep analysis of ${content.length} characters`);

        let score = 70;
        let reasoning = '';
        const detectedIssues: string[] = [];
        const lowerContent = content.toLowerCase();

        // 1. Check for extreme claims
        let extremeClaimCount = 0;
        for (const pattern of EXTREME_CLAIM_PATTERNS) {
            const matches = content.match(pattern);
            if (matches) {
                extremeClaimCount += matches.length;
                detectedIssues.push(`Extreme claim: "${matches[0]}"`);
            }
        }
        if (extremeClaimCount > 0) {
            score -= 15 * Math.min(extremeClaimCount, 3);
            reasoning += `Found ${extremeClaimCount} extreme/absolute claims. `;
        }

        // 2. Check for fake citation patterns
        let fakeCitationCount = 0;
        for (const pattern of FAKE_CITATION_PATTERNS) {
            const matches = content.match(pattern);
            if (matches) {
                fakeCitationCount += matches.length;
                matches.forEach(m => detectedIssues.push(`Unverified citation: ${m.substring(0, 50)}...`));
            }
        }
        if (fakeCitationCount > 0) {
            score -= 10 * Math.min(fakeCitationCount, 4);
            reasoning += `Contains ${fakeCitationCount} unverifiable citations. `;
        }

        // 3. Check for fake institution names
        for (const { pattern } of FAKE_INSTITUTION_PATTERNS) {
            if (pattern.test(content)) {
                score -= 20;
                detectedIssues.push(`Suspicious institution name detected`);
                reasoning += 'Contains potentially fabricated institution names. ';
                break;
            }
        }

        // 4. Check for hallucination indicators
        const foundIndicators = HALLUCINATION_INDICATORS.filter(k => lowerContent.includes(k));
        if (foundIndicators.length > 0) {
            score -= 10 * foundIndicators.length;
            reasoning += `Sensationalist language detected. `;
            foundIndicators.forEach(i => detectedIssues.push(`Sensationalist term: "${i}"`));
        }

        // 5. Check for trustworthy patterns
        let trustworthyCount = 0;
        for (const pattern of TRUSTWORTHY_PATTERNS) {
            if (pattern.test(content)) {
                trustworthyCount++;
            }
        }
        if (trustworthyCount >= 3) {
            score += 15;
            reasoning += 'Uses cautious, evidence-aligned language. ';
        } else if (trustworthyCount >= 1) {
            score += 5;
        }

        // 6. Check content length
        if (content.length < 200) {
            score -= 10;
            reasoning += 'Insufficient content for thorough analysis. ';
        }

        score = Math.max(0, Math.min(100, score));

        let verdict: VerificationResult['verdict'];
        let risk: VerificationResult['hallucinationRisk'];

        if (score >= 75) {
            verdict = 'Verified';
            risk = 'Low';
            if (!reasoning) reasoning = 'Content appears factual and uses responsible language.';
        } else if (score >= 45) {
            verdict = 'Suspicious';
            risk = 'Medium';
            if (!reasoning) reasoning = 'Some concerning patterns detected. Manual verification recommended.';
        } else {
            verdict = 'Highly Unreliable';
            risk = 'High';
            if (!reasoning) reasoning = 'Multiple hallucination indicators detected.';
        }

        // Generate suggested correction if issues were found
        let suggestedCorrection: string | undefined;
        if (score < 75 && detectedIssues.length > 0) {
            suggestedCorrection = this.cleanText(content);
            if (suggestedCorrection.length < content.length * 0.3) {
                suggestedCorrection = 'Text contains too many hallucinations. Consider rewriting from scratch using verified sources.';
            }
        }

        return {
            credibilityScore: score,
            verdict,
            reasoning: reasoning.trim(),
            hallucinationRisk: risk,
            detectedIssues: detectedIssues.length > 0 ? detectedIssues.slice(0, 5) : undefined,
            suggestedCorrection
        };
    }

    public static analyzeText(text: string): VerificationResult {
        return this.analyze('N/A (Direct Text)', 'User Input', text);
    }
}

