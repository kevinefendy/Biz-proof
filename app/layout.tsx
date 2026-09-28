import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "BizProof — Verified business records",
  description: "Buyer-confirmed business records, verifiable by anyone.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppProvider>
          <Header />
          <main className="main">
            <div className="container">{children}</div>
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
