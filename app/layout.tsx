import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "¿Dónde está Julio?",
  description: "Encuentra a Julio escondido en cada mundo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
