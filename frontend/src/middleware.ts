import authMiddleware from "next-auth/middleware";

export default function middleware(req: any, event: any) {
  return (authMiddleware as any)(req, event);
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*"],
};
