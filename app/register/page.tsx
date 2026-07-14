"use client";

import React, { Suspense, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, User, Phone, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input, Button } from "@/components";
import { supabase } from "@/lib/supabase";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  phone: z.string().optional().refine((val) => {
    if (!val) return true;
    // Allow +91 or typical phone formats
    return /^\+?[0-9\s\-]{8,15}$/.test(val);
  }, "Please enter a valid phone number (e.g. +91 98765 43210)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const { register: registerAuth, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/shop";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
          },
        });
        if (error) {
          setError(error.message);
          setLoading(false);
        }
      } else {
        setError("Supabase is not configured. Google Sign-In is unavailable.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setLoading(true);

    try {
      const res = await registerAuth(data.email, data.fullName, data.phone || undefined, data.password);
      if (res.success) {
        router.push(redirectPath);
      } else {
        setError(res.error || "Registration failed. Please check details and try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-secondary border border-accent/20 p-8 sm:p-10 shadow-lg font-poppins space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Join the Boutique</span>
        <h1 className="font-serif text-3xl font-light tracking-wide text-foreground">Create Account</h1>
        <div className="w-12 h-[1px] bg-accent mx-auto mt-4" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
        {error && (
          <div className="bg-error/10 text-error p-3 border border-error/20 font-medium">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          id="fullName"
          placeholder="Evelyn Vane"
          icon={<User className="w-4 h-4 text-zinc-400" />}
          error={errors.fullName?.message}
          required
          {...register("fullName")}
        />

        <Input
          label="Email Address"
          type="email"
          id="email"
          placeholder="name@example.com"
          icon={<Mail className="w-4 h-4 text-zinc-400" />}
          error={errors.email?.message}
          required
          {...register("email")}
        />

        <Input
          label="Phone Number (Optional)"
          type="tel"
          id="phone"
          placeholder="+91 98765 43210"
          icon={<Phone className="w-4 h-4 text-zinc-400" />}
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Password"
          type="password"
          id="password"
          placeholder="••••••••"
          error={errors.password?.message}
          required
          {...register("password")}
        />

        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          required
          {...register("confirmPassword")}
        />

        <p className="text-[10px] text-zinc-400">
          * Required fields. By registering, you agree to receive private collection arrivals notifications.
        </p>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          iconRight={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}
        >
          Register
        </Button>
      </form>

      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200/10"></div>
        </div>
        <span className="relative px-3 bg-secondary text-[9px] text-zinc-400 uppercase tracking-widest">
          Or continue with
        </span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        type="button"
        className="w-full flex items-center justify-center gap-2 bg-[#141414] border border-[#1F1F1F] text-zinc-200 px-4 py-3 rounded hover:border-accent hover:text-white transition duration-200 text-xs font-semibold mb-4"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign Up with Google
      </button>

      <div className="text-center text-[11px] text-zinc-500 border-t border-zinc-100 pt-6">
        <span>Already have an account? </span>
        <Link
          href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
          className="text-foreground font-semibold underline hover:text-primary transition"
        >
          Sign In here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <Suspense
          fallback={
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          }
        >
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
