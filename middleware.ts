import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check for auth token cookie set by the backend
    const token = request.cookies.get("token")

    // If accessing dashboard and not authenticated, redirect to login
    if (pathname.startsWith("/dashboard") && !token) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // If already logged in and visiting login, redirect to dashboard
    if (pathname === "/login" && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
}
