import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "810-pod-feed",
  description: "podcast aggregator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
