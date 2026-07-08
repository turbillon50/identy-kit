import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg">
      <div className="relative z-10 w-full max-w-sm px-4">
        <SignIn
          path="/sign-in"
          routing="path"
          afterSignInUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            variables: { colorPrimary: "#1e63d0", colorBackground: "#ffffff", colorText: "#0e2a5c" },
          }}
        />
      </div>
    </main>
  );
}
