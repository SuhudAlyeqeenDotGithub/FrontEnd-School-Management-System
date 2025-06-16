import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/main");
  const isLoginPage = pathname === "/signin";

  if (isProtected && !refreshToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  if (isLoginPage && refreshToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/main";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/main/:path*", "/main", "/signin"]
};
