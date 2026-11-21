import type { Metadata, Viewport } from "next";
// Fonts are bundled with the app (self-hosted): no request to Google at build or run time.
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
// Urdu in the guest chat (suggestion chips and replies) uses Nastaliq.
import "@fontsource/noto-nastaliq-urdu/400.css";
import "../globals.css";

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
