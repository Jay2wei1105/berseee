import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const poppins = Poppins({
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
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
    <html lang="en" className="scroll-smooth dark">
      <body
        className={`${openSans.variable} ${poppins.variable} antialiased font-sans flex flex-col min-h-screen`}
      >
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <Navbar />
        <main className="flex-1 pt-24 pb-12 flex flex-col relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
