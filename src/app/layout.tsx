import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { StudyProvider } from "@/lib/store/study-store";
import { SiteHeader, BottomNav } from "@/components/nav";
import { ServiceWorkerRegister } from "@/components/sw-register";

const sans = Inter({ variable: "--font-sans-var", subsets: ["latin"] });
const serif = Fraunces({ variable: "--font-serif-var", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "For Edith: Obs & Gyn", template: "%s · For Edith" },
  description:
    "A study companion for Edith's 6-week Obstetrics & Gynaecology junior clerkship at Uganda Christian University: notes, management, clinical reasoning, flashcards and quizzes.",
  applicationName: "For Edith",
  appleWebApp: { capable: true, title: "For Edith", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141013" },
  ],
};

// Apply the saved theme before paint to avoid a flash.
const themeScript = `try{var t=localStorage.getItem('for-edith:theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${serif.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <StudyProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:pb-16">{children}</main>
          <BottomNav />
          <ServiceWorkerRegister />
        </StudyProvider>
      </body>
    </html>
  );
}
