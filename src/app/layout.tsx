"use client";

import { Hind } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ThemeProvider } from "../../theme/themeProvider";

const fontStyle = Hind({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontStyle.className} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              value={{
                light: "light",
                dark: "dark",

                emerald: "emerald",
                "emerald-dark": "emerald-dark",

                teal: "teal",
                "teal-dark": "teal-dark",

                indigo: "indigo",
                "indigo-dark": "indigo-dark",

                plum: "plum",
                "plum-dark": "plum-dark",

                yellow: "yellow",
                "yellow-dark": "yellow-dark",

                cyan: "cyan",
                "cyan-dark": "cyan-dark"
              }}
            >
              {children}
            </ThemeProvider>
          </StoreProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
