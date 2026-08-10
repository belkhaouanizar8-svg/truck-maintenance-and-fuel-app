import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Fleet Manager | مدير الأسطول",
  description: "Manage your trucks, diesel fuel and repairs — Gestion de flotte camions, gasoil et réparations.",
};

const INIT_SCRIPT = `(function(){try{var s=null;try{s=localStorage.getItem('flotte-lang')}catch(e){}if(!s){var n=(navigator.language||'en').toLowerCase();s=n.indexOf('ar')===0?'ar':n.indexOf('fr')===0?'fr':'en'}document.documentElement.lang=s;document.documentElement.dir=s==='ar'?'rtl':'ltr'}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
