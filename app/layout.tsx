import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { Web3Provider } from "@/components/Web3Provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "BizProof — Buyer-confirmed business records",
  description: "Buyer-confirmed business records, verifiable by anyone. Built on Arbitrum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppProvider>
          <Web3Provider>
            <Header />
            <main className="main">{children}</main>
            <Footer />
          </Web3Provider>
        </AppProvider>
      </body>
    </html>
  );
}
