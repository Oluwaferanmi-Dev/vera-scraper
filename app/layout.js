import './globals.css';

export const metadata = {
  title: 'Vera — Event Review Desk',
  description: 'A human review queue for Nigeria fandom and culture events.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
