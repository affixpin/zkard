import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";

import "./globals.css";
import Providers from "./providers";
import { Auth } from "./auth";
import { Header } from "./header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "zkard",
  description: "zkard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen w-full flex-col">
          <Providers>
            <Auth>
              <Header />
              {children}
            </Auth>
          </Providers>
        </div>
      </body>
    </html>
  );
}
