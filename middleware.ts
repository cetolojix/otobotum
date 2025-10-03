import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const protectedPaths = ["/dashboard", "/instances", "/analytics", "/settings"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    // Check if user has active subscription or trial
    try {
      const checkResponse = await fetch(`${request.nextUrl.origin}/api/user/check-access`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      })

      if (checkResponse.ok) {
        const { hasAccess, needsUpgrade } = await checkResponse.json()

        if (needsUpgrade && !hasAccess) {
          // Redirect to subscription page if no access
          return NextResponse.redirect(new URL("/subscription", request.url))
        }
      }
    } catch (error) {
      console.error("[v0] Error checking subscription access:", error)
      // Continue on error to avoid blocking access
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
