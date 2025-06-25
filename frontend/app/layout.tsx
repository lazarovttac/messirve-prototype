import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { AppProvider } from "@/contexts/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Restaurant Manager Dashboard",
  description:
    "Dashboard for restaurant managers to oversee table reservations and meal preparations",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
