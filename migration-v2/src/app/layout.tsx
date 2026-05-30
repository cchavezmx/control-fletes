import { UserProvider } from "@auth0/nextjs-auth0";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/sonner";
import AppBar from "@/components/layout/AppBar";
import "@/app/globals.css";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error fetching data");
  }
  return res.json();
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <UserProvider>
          <AppBar />
          <SWRConfig value={{ fetcher }}>
            <div className="container mx-auto px-4 py-6">{children}</div>
          </SWRConfig>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
