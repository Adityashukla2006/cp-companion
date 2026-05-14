import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CP Companion",
  description: "A personal competitive programming tracker for ratings, contests, and practice momentum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
