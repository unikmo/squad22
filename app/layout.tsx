import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Squad22 - Card Game',
  description: 'Squad22: A strategic card game for football enthusiasts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
