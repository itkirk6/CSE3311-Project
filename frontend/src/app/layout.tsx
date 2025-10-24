import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OutdoorSpot",
  description: "Discover North Texas outdoor escapes tailored to your next adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen bg-neutral-950 text-neutral-100`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('/locations_screen.jpg')] bg-cover bg-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-neutral-950/80 to-neutral-950" />
        </div>
        {children}
      </body>
    </html>
  );
}
