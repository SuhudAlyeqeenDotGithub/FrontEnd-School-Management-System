import type { Metadata } from "next";
import { Hind } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";

const fontHind = Hind({
  variable: "--font-hind-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Al-Yeqeen School Management System",
  keywords: [
    "school",
    "management",
    "system",
    "Al-Yeqeen",
    "education",
    "attendance",
    "students",
    "teachers",
    "enrollment",
    "courses"
  ],
  description:
    "Al-Yeqeen School Management System is a comprehensive platform designed to streamline school operations, enhance communication, and improve the educational experience for students, teachers, and administrators."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontHind.variable} antialiased text-foregroundColor bg-backgroundColor`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
