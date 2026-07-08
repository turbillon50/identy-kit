import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg">
      <div className="relative z-10 w-full max-w-sm px-4">
        <SignUp
          path="/sign-up"
          routing="path"
          afterSignUpUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={{
            variables: { colorPrimary: "#1e63d0", colorBackground: "#ffffff", colorText: "#0e2a5c" },
          }}
        />
      </div>
    </main>
  );
}
