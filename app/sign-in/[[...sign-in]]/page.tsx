import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080c]">
      <div className="halo" />
      <div className="relative z-10 w-full max-w-sm px-4">
        <SignIn
          path="/sign-in"
          routing="path"
          afterSignInUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            variables: { colorPrimary: "#1FD1B8", colorBackground: "#0f1117", colorText: "#ffffff" },
          }}
        />
      </div>
    </main>
  );
}
