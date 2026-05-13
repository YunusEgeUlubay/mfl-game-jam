import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MFL Game Jam",
  description: "Manisa Fen Lisesi öğrencileri için oyun sergileme platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 relative z-10 pt-20">
          <div className="fixed inset-0 z-[-1] bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
          {children}
        </main>
        <footer className="glass py-6 text-center text-gray-500 text-sm mt-auto relative z-10">
          <p>© {new Date().getFullYear()} Manisa Fen Lisesi. Tüm hakları saklıdır.</p>
        </footer>
      </body>
    </html>
  );
}
