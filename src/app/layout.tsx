import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { isAuthenticated } from '@/app/login/actions/auth';
import { SubscribeNavbar } from '@/components/SubscribeNavbar';
import { LeaveMessage } from '@/components/LeaveMessage';
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shruti's Blog | Aesthetic Insights",
  description: "Personal essays, technical blogs, and insights by Shruti.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuth = await isAuthenticated();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <div className="layout-wrapper">
          <header className="main-header">
            <div className="container header-content">
              <a href="/" className="logo gradient-text">Shrutea.</a>
              <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <LeaveMessage />
                <SubscribeNavbar />
                <a href="/">Home</a>
                {isAuth && (
                  <a href="/studio" className="btn-secondary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}>Studio</a>
                )}
              </nav>
            </div>
          </header>

          <main className="main-content">
            {children}
          </main>

          <footer className="main-footer">
            <div className="container">
              <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Shrutea. All rights reserved.</p>
                <div className="social-links">
                  <a href="https://linkedin.com/in/shruthibalasubramanian" target="_blank" rel="noopener noreferrer" style={{ transition: 'opacity 0.2s' }}>LinkedIn</a>
                  <a href="https://instagram.com/10shruthi" target="_blank" rel="noopener noreferrer" style={{ transition: 'opacity 0.2s' }}>Instagram</a>
                  <a href="mailto:shruanalytics@gmail.com" style={{ transition: 'opacity 0.2s' }}>Email</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
