import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { StudyProvider } from "@/lib/store/study-store";
import { Sidebar, TopBar, BottomNav, CommandMenu } from "@/components/nav";
import { ServiceWorkerRegister } from "@/components/sw-register";

const sans = Geist({ variable: "--font-sans-var", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif-var", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "For Edith", template: "%s · For Edith" },
  description:
    "A study companion for Edith's 6-week Obstetrics & Gynaecology and Paediatrics junior clerkships at Uganda Christian University: notes, management, clinical reasoning, flashcards and quizzes.",
  applicationName: "For Edith",
  appleWebApp: { capable: true, title: "For Edith", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#111113" },
  ],
};

// Apply the saved theme before paint to avoid a flash. The server renders Obs & Gyn lists; if Edith
// last chose another rotation, hide those lists (data-rot-pending, see globals.css) until the store
// has loaded it. The timeout is a safety net in case the app never hydrates.
const themeScript = `try{var d=document.documentElement,t=localStorage.getItem('for-edith:theme');if(t==='light'||t==='dark')d.dataset.theme=t;var r=localStorage.getItem('for-edith:rotation');if(r&&r!=='obgyn'){d.dataset.rotPending='';setTimeout(function(){delete d.dataset.rotPending},2500)}}catch(e){}`;

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
