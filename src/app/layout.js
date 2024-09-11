import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/./components/ui/sonner";

const outfit = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Waffles",
  description: "Track your expenses",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      fallbackRedirectUrl='/'
    >

      <html lang="en">
        <body className={outfit.className}>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
