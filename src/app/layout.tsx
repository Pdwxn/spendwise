import type { Metadata } from 'next';
import './globals.css';
import { FinanceProvider } from '@/context/FinanceContext';
import { Sidebar } from '@/components/layout/Sidebar';

import { Inter, JetBrains_Mono } from 'next/font/google';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SpendWise',
  description: 'Tu gestor de finanzas personales',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${fontBody.variable} ${fontBody.variable}`}>
        <FinanceProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main
              style={{
                flex: 1,
                marginLeft: '220px',
                padding: '2rem 2.5rem',
                minHeight: '100vh',
                background: 'var(--color-background)',
              }}
            >
              {children}
            </main>
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}