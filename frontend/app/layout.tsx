import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DisclaimerBanner from "@/components/DisclaimerBanner";

export const metadata: Metadata = {
  title: "OncoLens AI | Breast Cancer Cytology Research Platform",
  description: "Explore the data. Understand the model. Investigate the predictions. An educational and research platform powered by Scikit-learn and the Wisconsin Breast Cancer dataset.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans bg-canvas text-navy antialiased selection:bg-teal selection:text-white">
        <DisclaimerBanner />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
