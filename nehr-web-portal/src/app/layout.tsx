import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

// Self-hosted rather than next/font/google: the Google Fonts build-time
// fetch silently drops the font (falling back to the browser default) on
// networks that route through a corporate proxy, since Next's font
// loader isn't proxy-aware.
const averta = localFont({
  src: [
    { path: "../../public/fonts/Averta-Thin.otf", weight: "100", style: "normal" },
    { path: "../../public/fonts/Averta-Extrathin.otf", weight: "200", style: "normal" },
    { path: "../../public/fonts/Averta-Light.otf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Averta-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Averta-Semibold.otf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Averta-Bold.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Averta-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "../../public/fonts/Averta-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEHR Platform",
  description: "Nigerian Electronic Health Record Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${averta.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
