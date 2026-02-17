import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Simple i18n-only middleware — auth protection handled per-page via auth()
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
