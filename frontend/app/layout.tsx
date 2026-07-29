import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvestWise",
  description:
    "An educational investing planner for exploring hypothetical long-term growth."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
