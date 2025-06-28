import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { AppProvider } from "@/contexts/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Panel de Control del Restaurante",
  description:
    "Panel de control para gerentes de restaurantes para supervisar reservas de mesas y preparación de comidas",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
