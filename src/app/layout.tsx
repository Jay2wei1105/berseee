import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BERS2 Assessment | Delta Energy",
  description: "Advanced energy assessment tool utilizing sophisticated models to diagnose building efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${notoSansJP.variable} ${notoSerifJP.variable} antialiased font-sans flex flex-col min-h-screen bg-background text-foreground tracking-tight`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* High-End Architectural / Grid Background (Global) */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)] opacity-[0.2]" />
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-sky-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50" />
            <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-zinc-400/20 dark:bg-zinc-800/50 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen opacity-50" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
          </div>

          <Navbar />
          <main className="flex-1 pt-24 pb-12 flex flex-col relative z-10">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>

  );
}
