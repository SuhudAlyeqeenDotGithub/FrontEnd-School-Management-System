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
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </StoreProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
