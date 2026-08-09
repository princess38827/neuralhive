import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuralHive — Social community",
  description: "A human-first social community for ideas, people, and connection.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
