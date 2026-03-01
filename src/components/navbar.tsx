"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

export function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 50);

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scrolling down
                setScrollDirection("down");
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up
                setScrollDirection("up");
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const navItems = [
        { id: "/", label: "Home", desc: "Delta Energy" },
        { id: "/assessment", label: "BERS Assessment", desc: "Start Evaluation" },
        { id: "/analytics", label: "Neural Analytics", desc: "Cyber Visualization" },
        { id: "/dashboard", label: "Executive Info", desc: "Summary" },
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4`}
        >
            <div
                className={`w-full max-w-5xl rounded-full transition-all duration-300 overflow-hidden ${!isScrolled
                    ? "bg-transparent border border-transparent"
                    : scrollDirection === "down"
                        ? "bg-background/20 backdrop-blur-md border border-border/20 shadow-sm"
                        : "bg-background/60 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    }`}
            >
                <div className="flex items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3 z-10 group">
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
                                    className={`relative text-sm font-medium transition-colors ${isActive ? "text-sky-800" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-sky-800 rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                        <div className="h-4 w-[1px] bg-white/10 mx-2" />
                        <AuthModal />
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
                                            ? "bg-sky-800/20 text-sky-800"
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
