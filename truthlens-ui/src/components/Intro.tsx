import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { SpaceScene } from './Rocket';

export const Intro = ({ onComplete }: { onComplete: () => void }) => {
    const [isLaunching, setIsLaunching] = useState(false);
    const [phase, setPhase] = useState(0); // 0: Idle, 1: Ignition, 2: Liftoff

    useEffect(() => {
        const sequence = async () => {
            // Initial suspense
            await new Promise(r => setTimeout(r, 1500));
            setPhase(1); // Ignition

            // Engines firing
            await new Promise(r => setTimeout(r, 1500));
            setIsLaunching(true);
            setPhase(2); // Liftoff

            // Final duration
            await new Promise(r => setTimeout(r, 2500));
            onComplete();
        };
        sequence();
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-charcoal flex flex-col items-center justify-center overflow-hidden"
            exit={{
                opacity: 0,
                transition: { duration: 1, ease: "easeInOut" }
            }}
        >
            <motion.div
                className="absolute inset-0 z-0"
                animate={phase === 2 ? { scale: 1.2, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 3, ease: "easeIn" }}
            >
                <Canvas shadows dpr={[1, 2]}>
                    <Suspense fallback={null}>
                        <SpaceScene isLaunching={isLaunching} />
                    </Suspense>
                </Canvas>
            </motion.div>

            {/* Foreground UI */}
            <div className="relative z-10 text-center select-none pointer-events-none">
                <motion.div
                    animate={phase === 2 ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <motion.h1
                        initial={{ opacity: 0, letterSpacing: "1em" }}
                        animate={{ opacity: 1, letterSpacing: "0.4em" }}
                        className="text-4xl md:text-7xl font-black text-white mb-6 drop-shadow-[0_0_30px_rgba(0,229,255,0.5)]"
                    >
                        TRUTHLENS<span className="text-accentCyan">AI</span>
                    </motion.h1>

                    <div className="flex flex-col items-center gap-4">
                        <AnimatePresence mode="wait">
                            {phase === 0 && (
                                <motion.div
                                    key="p0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Awaiting Authorization</span>
                                </motion.div>
                            )}
                            {phase === 1 && (
                                <motion.div
                                    key="p1"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-2 h-2 rounded-full bg-accentLime animate-ping" />
                                    <span className="text-[10px] font-black tracking-[0.3em] text-accentLime uppercase">Ignition Sequence Protocol</span>
                                </motion.div>
                            )}
                            {phase === 2 && (
                                <motion.div
                                    key="p2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-[10px] font-black tracking-[0.5em] text-accentCyan uppercase animate-pulse">Maximum Thrust</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Progress Bar */}
                        <div className="w-48 h-[2px] bg-white/5 rounded-full relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-accentCyan shadow-[0_0_10px_#00E5FF]"
                                initial={{ x: "-100%" }}
                                animate={{ x: phase === 2 ? "100%" : "0%" }}
                                transition={{
                                    x: { duration: phase === 0 ? 1.5 : 3, ease: phase === 2 ? "easeIn" : "easeOut" }
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Flash Effect on exit */}
            <AnimatePresence>
                {phase === 2 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        className="absolute inset-0 bg-white pointer-events-none z-20"
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
