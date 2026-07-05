import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Verify the backend-issued JWT (HS256) and confirm it belongs to a hospital.
 * Runs on the edge runtime, so it uses `jose` (Web Crypto) rather than
 * `jsonwebtoken`. Fails closed: any error or a missing secret -> not authed.
 */
async function isValidHospital(token: string): Promise<boolean> {
    if (!JWT_SECRET) {
        console.error(
            "[frontend middleware] JWT_SECRET is not set — refusing access. " +
                "Set it in .env to match the backend."
        )
        return false
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET),
            { algorithms: ["HS256"] }
        )
        return payload.role === "Hospital"
    } catch {
        // invalid signature, expired, malformed, wrong algorithm, etc.
        return false
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get("token")?.value
    const isAuthed = token ? await isValidHospital(token) : false

    // Protect the dashboard: only verified hospitals get through.
    if (pathname.startsWith("/dashboard") && !isAuthed) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        const response = NextResponse.redirect(loginUrl)
        // Clear the invalid/forged cookie if it exists
        if (token) {
            response.cookies.delete("token")
        }
        return response
    }

    // If visiting login, handle logout query param or redirect authenticated users
    if (pathname === "/login") {
        if (request.nextUrl.searchParams.has("logout")) {
            const response = NextResponse.next()
            response.cookies.delete("token")
            return response
        }
        if (isAuthed) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        if (token) {
            // Token present but failed verification — clear it for a clean login.
            const response = NextResponse.next()
            response.cookies.delete("token")
            return response
        }
    }

    return NextResponse.next()

}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
}
