import { AuthForm } from "@/components/auth/auth-form";
import { AppLogo } from "@/components/icons";

export default function LoginPage() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <AppLogo className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to MacroSleep
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in or create an account to track your health
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
