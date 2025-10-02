"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Logo from "../../../components/atoms/Logo";
import ErrorMessage from "../../../components/atoms/ErrorMessage";
import SuccessMessage from "../../../components/atoms/SuccessMessage";
import FormField from "../../../components/forms/FormField";
import Link from "next/link";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    const message = searchParams?.get("message");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const onSubmit = async (data: SignInFormValues) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_login_id: data.email,
          password: data.password,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Invalid credentials");
      } else {
        // Store token (example: localStorage, cookie, etc.)
        localStorage.setItem("token", result.token);
        router.push("/dashboard");
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
          <p className="text-slate-600 mt-2">Sign in to your account</p>
        </div>
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your construction projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <SuccessMessage message={successMessage} />
              <ErrorMessage message={error} />
              <FormField
                id="email"
                label="Email"
                type="email"
                required
                placeholder="Enter your email"
                error={errors.email?.message}
                {...register("email")}
              />
              <FormField
                id="password"
                label="Password"
                type="password"
                required
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register("password")}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="remember" className="text-sm">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="text-center mt-6">
          <p className="text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
