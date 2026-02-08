import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Simulation Hypothesis",
  description: "A generative history of fictional civilizations powered by Gemini 3.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
