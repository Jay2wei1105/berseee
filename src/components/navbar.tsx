"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { id: "/", label: "Home", desc: "Delta Energy" },
        { id: "/assessment", label: "BERS Assessment", desc: "Start Evaluation" },
        { id: "/dashboard", label: "Analytics", desc: "Visual Reports" },
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500`}
        >
            <div
                className={`w-full max-w-5xl rounded-2xl transition-all duration-300 overflow-hidden ${isScrolled
                        ? "bg-card/40 backdrop-blur-xl border border-white/10 shadow-2xl"
                        : "bg-transparent border border-transparent"
                    }`}
            >
                <div className="flex items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 z-10 group">
                        <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <svg width="20" height="20" viewBox="0 0 100 100" fill="currentColor">
                                <polygon points="50,10 90,90 10,90" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-foreground">
                            DSE<span className="font-light text-muted-foreground">.bers</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => {
                            const isActive = pathname === item.id;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.id}
                                    className={`relative text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-foreground"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t border-white/10 bg-card/60 backdrop-blur-2xl"
                        >
                            <nav className="flex flex-col px-4 py-4 gap-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.id}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium ${pathname === item.id
                                                ? "bg-primary/20 text-primary"
                                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                            }`}
                                    >
                                        {item.label}
                                        <ArrowRight size={16} className="opacity-50" />
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}
