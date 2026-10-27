import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Cheuk Hin Li — Robotics Engineer",
  description:
    "Cheuk Hin Li — robotics and embedded software engineer. STM32 firmware, motion control, sensor fusion and robot localisation. BEng Computer Science (AI) at HKUST.",
  authors: [{ name: "Cheuk Hin Li" }],
  openGraph: {
    title: "Cheuk Hin Li — Robotics Engineer",
    description:
      "Embedded firmware · motion control · localisation. Built the climbing mechanism and localisation stack for HKUST's ABU Robocon robot.",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230a0c0d'/%3E%3Cpath d='M18 46V18h7l7 11 7-11h7v28h-7V31l-7 11-7-11v15z' fill='%23c9ff3f'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">
        {children}
        <div aria-hidden="true" className="page-fx" />
      </body>
    </html>
  );
}
