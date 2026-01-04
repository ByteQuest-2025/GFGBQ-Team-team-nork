import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scraperService } from '../services/api';
import { Globe, ShieldCheck, Database, Zap } from 'lucide-react';

export const Dashboard = ({ user }: any) => {
    const [url, setUrl] = useState('');
    const [paragraph, setParagraph] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');

    const handleScrape = async (force: boolean = false) => {
        if (!url) return;
        setLoading(true);
        setError(null);
        try {
            const res = await scraperService.scrape(url, force);
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed. This host may be blocking our automated bot.');
        } finally {
            setLoading(false);
        }
    };

    const handleRandomScrape = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await scraperService.getRandomSample();
            setUrl(res.data.url);
            setResult(res.data);
            setActiveTab('url');
        } catch (err: any) {
            setError('Failed to fetch a random sample. System fallback active.');
        } finally {
            setLoading(false);
        }
    };

    const handleTextVerify = async () => {
        if (!paragraph || paragraph.length < 10) {
            setError('Please enter at least 10 characters for AI analysis.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await scraperService.verifyText(paragraph);
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed. AI Engine is temporarily at capacity.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
            <header className="mb-12">
                <h1 className="text-3xl font-bold mb-2">Welcome Back, Agent</h1>
                <p className="text-mutedText uppercase tracking-widest text-xs font-bold">Session Active: {user.email}</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Scraper Control */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-6 mb-8 border-b border-white/5">
                            <button
                                onClick={() => setActiveTab('url')}
                                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'url' ? 'text-accentCyan border-b-2 border-accentCyan scale-110' : 'text-white/20 hover:text-white/60'}`}
                            >
                                URL SCAN
                            </button>
                            <button
                                onClick={() => setActiveTab('text')}
                                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'text' ? 'text-accentLime border-b-2 border-accentLime scale-110' : 'text-white/20 hover:text-white/60'}`}
                            >
                                TEXT VERIFY (BETA)
                            </button>
                        </div>

                        {activeTab === 'url' ? (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <input
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder="https://source-to-verify.com/article"
                                        className="flex-1 bg-charcoal/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accentCyan"
                                    />
                                    <button
                                        onClick={() => handleScrape(false)}
                                        disabled={loading}
                                        className="px-6 py-3 bg-accentCyan text-charcoal font-bold rounded-xl disabled:opacity-50 hover:bg-white transition-colors"
                                    >
                                        {loading ? "SCANNING..." : "SCAN"}
                                    </button>
                                    <button
                                        onClick={handleRandomScrape}
                                        disabled={loading}
                                        title="Surprise Me (Demo Mode)"
                                        className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <Zap size={20} className={loading ? 'animate-pulse' : ''} />
                                    </button>
                                </div>
                                <p className="mt-4 text-xs text-mutedText italic">TruthLens respects robots.txt. Click SCAN to initiate.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <textarea
                                    value={paragraph}
                                    onChange={e => setParagraph(e.target.value)}
                                    placeholder="Paste a paragraph, news claim, or code snippet here to check for hallucinations..."
                                    rows={5}
                                    className="w-full bg-charcoal/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accentLime resize-none font-sans text-sm"
                                />
                                <button
                                    onClick={handleTextVerify}
                                    disabled={loading || paragraph.length < 10}
                                    className="w-full py-4 bg-accentLime text-charcoal font-black rounded-xl disabled:opacity-50 hover:bg-white transition-all uppercase tracking-widest text-xs"
                                >
                                    {loading ? "ANALYZING CONTENT..." : "CHECK HALLUCINATIONS"}
                                </button>
                                <p className="text-[10px] text-white/20 text-center uppercase tracking-widest">Powered by Gemini Pro • High Precision Mode</p>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-accentMagenta/10 border border-accentMagenta/30 p-4 rounded-xl text-accentMagenta text-sm font-bold"
                            >
                                {error}
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-8 border-accentLime/20"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-accentLime text-[10px] font-black uppercase tracking-[0.3em] block">Source Validated</span>
                                            {(result as any).autoOverridden && (
                                                <span className="bg-accentLime/10 text-accentLime border border-accentLime/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Auto-Override Active</span>
                                            )}
                                        </div>
                                        <h4 className="text-2xl font-bold mb-2 text-white">{result.title}</h4>
                                        <p className="text-mutedText text-sm">{result.url}</p>
                                    </div>
                                    <ShieldCheck className="text-accentLime" size={32} />
                                </div>

                                <div className="space-y-6">
                                    {/* AI Verification Badge */}
                                    {result.verification && (
                                        <div className="bg-charcoal/50 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                                            <div className={`absolute top-0 left-0 w-1 h-full ${result.verification.verdict === 'Verified' ? 'bg-accentLime' :
                                                result.verification.verdict === 'Suspicious' ? 'bg-accentMagenta' : 'bg-red-500'
                                                }`} />

                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">AI Verification Report</h5>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.verification.verdict === 'Verified' ? 'bg-accentLime/10 text-accentLime' :
                                                    result.verification.verdict === 'Suspicious' ? 'bg-accentMagenta/10 text-accentMagenta' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {result.verification.verdict}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="glass-card p-4 bg-white/5">
                                                    <span className="text-[9px] text-white/20 uppercase block mb-1">Credibility Score</span>
                                                    <span className="text-2xl font-black text-accentCyan">{result.verification.credibilityScore}%</span>
                                                </div>
                                                <div className="glass-card p-4 bg-white/5">
                                                    <span className="text-[9px] text-white/20 uppercase block mb-1">Hallucination Risk</span>
                                                    <span className={`text-2xl font-black ${result.verification.hallucinationRisk === 'Low' ? 'text-accentLime' :
                                                        result.verification.hallucinationRisk === 'Medium' ? 'text-accentMagenta' : 'text-red-500'
                                                        }`}>{result.verification.hallucinationRisk}</span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-mutedText leading-relaxed">
                                                {result.verification.reasoning}
                                            </p>

                                            {/* Detected Issues */}
                                            {result.verification.detectedIssues && result.verification.detectedIssues.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <h6 className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-2">⚠️ Detected Issues</h6>
                                                    <ul className="space-y-1">
                                                        {result.verification.detectedIssues.map((issue: string, idx: number) => (
                                                            <li key={idx} className="text-xs text-red-300/80 flex items-start gap-2">
                                                                <span className="text-red-500">•</span>
                                                                <span>{issue}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Suggested Correction */}
                                            {result.verification.suggestedCorrection && (
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <h6 className="text-[9px] font-black uppercase tracking-widest text-accentLime mb-2">✅ Suggested Correction</h6>
                                                    <p className="text-xs text-accentLime/80 bg-accentLime/5 p-3 rounded-lg border border-accentLime/10">
                                                        {result.verification.suggestedCorrection}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] font-bold text-white/40 uppercase mb-2 block">Description Meta</label>
                                        <p className="text-sm border-l-2 border-accentCyan pl-4 py-1 italic">{result.metaDescription || "No metadata provided by host."}</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-white/40 uppercase mb-2 block">Content Snippet (Verification Base)</label>
                                        <div className="bg-charcoal/80 p-4 rounded-lg font-mono text-xs overflow-x-auto text-mutedText">
                                            {result.rawHtml ? result.rawHtml.substring(0, 500) + '...' : 'Parsing error.'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Stats / Feedback Area */}
                <div className="space-y-8">
                    <div className="glass-card p-6">
                        {result && (
                            <div className="space-y-4">
                                <h4 className="font-bold mb-4 text-xs uppercase tracking-widest text-accentCyan">System Pulse</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-mutedText">Latency</span>
                                        <span className="text-xs font-mono text-white">{(result as any).latency || '42ms'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-mutedText">Verification Mode</span>
                                        <span className={`text-[10px] font-black ${(result as any).autoOverridden ? 'text-accentLime' : 'text-accentCyan'}`}>
                                            {(result as any).autoOverridden ? 'RELAXED (AUTO)' : 'SECURE (DIRECT)'}
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full mt-2">
                                        <motion.div
                                            className="h-full bg-accentCyan"
                                            animate={{ width: ["10%", "90%", "60%"] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 overflow-hidden relative">
                        <Globe className="absolute -bottom-4 -right-4 text-accentCyan/5" size={120} />
                        <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-accentMagenta">Audit Logs</h4>
                        <div className="space-y-4 relative z-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 items-start border-b border-white/5 pb-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accentLime mt-1.5" />
                                    <div>
                                        <p className="text-[10px] font-bold">Verification Request #{1024 + i}</p>
                                        <time className="text-[8px] text-mutedText uppercase">2 minutes ago</time>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
