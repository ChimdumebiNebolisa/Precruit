import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Precruit',
  description: 'Early hiring-signal tracking for startup internship roles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}