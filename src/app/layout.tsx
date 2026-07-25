import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadBot — asistent AI bilingv pentru captare lead-uri",
  description:
    "Asistent de chat bilingv (RO/RU) care răspunde vizitatorilor 24/7, le califică cererea și salvează lead-ul automat. Demo live.",
};

export const viewport = {
  themeColor: "#070910",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${GeistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
