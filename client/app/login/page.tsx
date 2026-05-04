import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md items-center py-8 sm:py-10">
      <AuthForm mode="login" />
    </div>
  );
}
