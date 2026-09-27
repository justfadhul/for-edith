import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { StudyProvider } from "@/lib/store/study-store";
import { Sidebar, TopBar, BottomNav, CommandMenu } from "@/components/nav";
import { ServiceWorkerRegister } from "@/components/sw-register";

const sans = Inter({ variable: "--font-sans-var", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif-var", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

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
    { media: "(prefers-color-scheme: light)", color: "#fcfbfb" },
    { media: "(prefers-color-scheme: dark)", color: "#111113" },
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
          <Sidebar />
          <div className="lg:pl-60">
            <TopBar />
            <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-16">{children}</main>
          </div>
          <BottomNav />
          <CommandMenu />
          <ServiceWorkerRegister />
        </StudyProvider>
      </body>
    </html>
  );
}
