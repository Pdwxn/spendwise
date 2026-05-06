import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceProvider } from "@/context/FinanceContext";
import { PreferencesProvider } from "@/context/PreferencesContext";
import "react-toastify/dist/ReactToastify.css";
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
  title: "SpendWise",
  description: "Aplicación de finanzas personales para usuarios hispanohablantes.",
  applicationName: "SpendWise",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SpendWise",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#041016",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <PreferencesProvider>
            <FinanceProvider>
              <AppShell>{children}</AppShell>
            </FinanceProvider>
          </PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
