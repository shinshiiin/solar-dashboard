import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Header from "./components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sfPro = localFont({
  src: [
    {
      path: "./fonts/sfprodisplayregular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sfprodisplaybold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
});

export const metadata: Metadata = {
  title: "Solar Dashboard",
  description: "Real-time Solar Monitoring Dashboard",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sfPro.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div
          className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0b]"
        >
          <Header />

          <main className="flex-1 text-[#FFFFFFB3]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}