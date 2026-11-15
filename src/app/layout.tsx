import type { Metadata, Viewport } from "next";
// Fonts are bundled with the app (self-hosted): no request to Google at build or run time.
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/readex-pro";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bayanatk Concierge",
  description: "Multilingual AI guest assistant for hotels.",
};

export const viewport: Viewport = { themeColor: "#0c8e6a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
