import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Intro } from './components/Intro';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';

function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    React.useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // In a real app, we would verify the token with the backend here
            // For hackathon automation, we trust the local storage and let subsequent API calls handle 401s
            const savedEmail = localStorage.getItem('userEmail');
            if (savedEmail) {
                setUser({ email: savedEmail, id: 'session-persist' });
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-charcoal selection:bg-accentCyan/30 relative overflow-hidden">
            {/* Global Background Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accentCyan/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accentMagenta/5 blur-[120px] rounded-full" />
            </div>

            <AnimatePresence>
                {loading && <Intro key="intro" onComplete={() => setLoading(false)} />}
            </AnimatePresence>

            {!loading && (
                <motion.div
                    className="relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <Navbar user={user} onLogout={() => {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('userEmail');
                        setUser(null);
                    }} />

                    <main>
                        {!user ? (
                            <Hero
                                onLogin={(u) => setUser(u)}
                                onGetStarted={() => document.getElementById('access-control')?.scrollIntoView({ behavior: 'smooth' })}
                                onDocClick={() => window.open('https://github.com/GoogleDeepMind/TruthLensAI', '_blank')}
                            />
                        ) : (
                            <Dashboard user={user} />
                        )}
                    </main>

                    <footer className="py-12 px-6 border-t border-white/5 text-center text-mutedText text-sm">
                        <p>© 2026 TruthLens AI. Polite Scraping & Hallucination Verification Engine.</p>
                        <p className="mt-2 text-white/20 uppercase tracking-widest">Research Use Only</p>
                    </footer>
                </motion.div>
            )}
        </div>
    );
}

export default App;
