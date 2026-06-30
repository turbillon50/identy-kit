import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080c]">
      <div className="halo" />
      <div className="relative z-10 w-full max-w-sm px-4">
        <SignUp
          path="/sign-up"
          routing="path"
          afterSignUpUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={{
            variables: { colorPrimary: "#1FD1B8", colorBackground: "#0f1117", colorText: "#ffffff" },
          }}
        />
      </div>
    </main>
  );
}
