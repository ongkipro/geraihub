import type { Metadata } from "next";
import "./style.css";

export const metadata: Metadata = {
  title: "GeraiHub",
  description: "Operasional pengiriman gerai",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
