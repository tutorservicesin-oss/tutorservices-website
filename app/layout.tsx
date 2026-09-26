import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TutorServices AI Ad Studio",
  description: "Private local-first advertising creative generator for TutorServices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
