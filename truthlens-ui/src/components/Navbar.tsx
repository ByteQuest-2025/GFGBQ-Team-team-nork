import React from 'react';
import { authService } from '../services/api';

export const Navbar = ({ user, onLogout }: any) => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-charcoal/50 border-b border-white/5">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accentCyan rounded-lg rotate-45 flex items-center justify-center">
                    <div className="w-4 h-4 bg-charcoal rotate-45" />
                </div>
                <span className="font-bold tracking-smooch text-white">TRUTHLENS</span>
            </div>

            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <span className="hidden md:inline text-mutedText text-sm">{user.email}</span>
                        <button
                            onClick={() => { authService.logout(); onLogout(); }}
                            className="text-sm font-bold text-accentMagenta hover:opacity-80"
                        >
                            LOGOUT
                        </button>
                    </>
                ) : (
                    <button className="text-sm font-bold text-accentCyan">CONNECT</button>
                )}
            </div>
        </nav>
    );
};
