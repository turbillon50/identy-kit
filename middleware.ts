import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    const { userId } = await auth();
    if (!userId) {
      const { redirectToSignIn } = await import("@clerk/nextjs/server");
      return redirectToSignIn();
    }
  }
});

export const config = {
  matcher: ["/((?!.*\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
