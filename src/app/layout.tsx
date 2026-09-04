import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ReminderWatcher } from "@/components/ReminderWatcher";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hair Craft Mens Saloon",
    template: "%s · Hair Craft",
  },
  description:
    "Book haircuts and beard trims with Babu or Shivappa at Hair Craft Mens Saloon. AI style recommendations included.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <ReminderWatcher />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
