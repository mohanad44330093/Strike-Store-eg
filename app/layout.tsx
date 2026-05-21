import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STRIKE STORE",
  description: "Premium Compression Wear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      <body>{children}</body>
    </html>
  );
}

// ============================================== |
// =======This code was written by Mohannad Ahmed |
// ============================================== |