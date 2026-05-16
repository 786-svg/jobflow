import './globals.css';

export const metadata = {
  title: 'JobFlow — quality-first job search',
  description: 'A quieter, smarter way to find roles. Aggregates listings from across the open web, scores them against your resume, and skips the noise.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen">{children}</body>
    </html>
  );
}
