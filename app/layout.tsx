import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "IPNUS | Find Low Cash Prescription Prices Near You", template: "%s | IPNUS" },
  description: "Search low cash prescription prices from participating independent pharmacies near you. Compare published prices, skip the coupon-card maze, and reserve directly with local pharmacies.",
  metadataBase: new URL("https://ipnus.com"),
  openGraph: { title: "IPNUS | Low Cash Prescription Prices from Independent Pharmacies", description: "Compare published cash prescription prices from participating independent pharmacies and reserve directly with local pharmacies.", url: "https://ipnus.com", siteName: "IPNUS", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="min-h-full">{children}</body></html>;
}
