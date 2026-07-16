"use server";

import { cookies, headers } from "next/headers";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { dbService } from "@/services/dbService";
import { NotificationService } from "@/services/notificationService";
import { UserProfile } from "@/types";

const SESSION_COOKIE_NAME = "sss_boutique_session";

export async function getCurrentUser(): Promise<UserProfile | null> {
  // 1. Try to read from the session cookie first (keeps user logged in on F5 refresh!)
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (session?.value) {
    try {
      const userProfile = JSON.parse(session.value) as UserProfile;
      // Sync access token to database client singleton if present
      const accessToken = cookieStore.get("sss_boutique_access_token")?.value;
      if (accessToken && isSupabaseConfigured() && supabase) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: ""
        });
      }
      return userProfile;
    } catch { /* skip and check supabase fallback */ }
  }

  // 2. Fallback to Supabase session directly (if configured)
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get profile details
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const userProfile: UserProfile = profile ? {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        phone: profile.phone,
        role: profile.role || "customer",
        createdAt: profile.created_at,
      } : {
        id: user.id,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "Customer",
        role: (user.user_metadata?.role as "admin" | "customer") || "customer",
        createdAt: user.created_at,
      };

      // Set cookie to persist it
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(userProfile), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return userProfile;
    } catch (err) {
      console.error("Supabase auth check failed:", err);
      return null;
    }
  }

  return null;
}

export async function login(email: string, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || "defaultPassword123!",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || "",
        fullName: profile?.full_name || data.user.user_metadata?.full_name || "Customer",
        role: profile?.role || data.user.user_metadata?.role || "customer",
        createdAt: data.user.created_at,
      };

      // Save user session in cookie for server-side proxy checks
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(userProfile), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      if (data.session?.access_token) {
        cookieStore.set("sss_boutique_access_token", data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }

      return { success: true, user: userProfile };
    } else {
      // Mock Mode: check users in db.json
      const users = await dbService.getMockUsers();
      let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        // Automatically create a customer account on first login to make testing seamless!
        user = await dbService.createMockUser({
          email,
          fullName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          role: email.startsWith("admin@") ? "admin" : "customer", // Auto-detect admin if email is admin@
        });
      }

      // Save user in cookie
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return { success: true, user };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function register(
  email: string,
  fullName: string,
  phone?: string,
  password?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    if (isSupabaseConfigured() && supabase) {
      // Determine origin dynamically for verification redirects
      const headersList = await headers();
      const host = headersList.get("host") || "";
      const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      const origin = host ? `${protocol}://${host}` : "";

      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || "defaultPassword123!",
        options: {
          emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
          data: {
            full_name: fullName,
            role: "customer",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Upsert into profile to avoid key conflicts and sync additional phone details
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          phone: phone || null,
          role: "customer",
        });
      }

      const userProfile: UserProfile = {
        id: data.user?.id || "",
        email,
        fullName,
        phone,
        role: "customer",
        createdAt: data.user?.created_at || new Date().toISOString(),
      };

      // Save user session in cookie so they are logged in after registration
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(userProfile), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      if (data.session?.access_token) {
        cookieStore.set("sss_boutique_access_token", data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }

      try {
        await NotificationService.sendWelcomeEmail(fullName, email, userProfile.id);
      } catch (ne) {
        console.error("Failed to send welcome email:", ne);
      }

      return { success: true, user: userProfile };
    } else {
      // Mock Mode
      const users = await dbService.getMockUsers();
      const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return { success: false, error: "Email already registered" };
      }

      const newUser = await dbService.createMockUser({
        email,
        fullName,
        phone,
        role: email.startsWith("admin@") ? "admin" : "customer",
      });

      // Save user in cookie
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(newUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      try {
        await NotificationService.sendWelcomeEmail(fullName, email, newUser.id);
      } catch (ne) {
        console.error("Failed to send welcome email:", ne);
      }

      return { success: true, user: newUser };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function logout(): Promise<{ success: boolean }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("SignOut error:", e);
    }
  }
  
  // Clear Cookies
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("sss_boutique_access_token");
  
  return { success: true };
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    let customerName = "Valued Customer";
    
    if (isSupabaseConfigured() && supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("email", email)
        .maybeSingle();
      if (profile) customerName = profile.full_name;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://sssboutique.com/reset-password",
      });
      if (error) return { success: false, error: error.message };
    } else {
      const users = await dbService.getMockUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) customerName = user.fullName;
    }
    
    const resetToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const resetLink = `https://sssboutique.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    try {
      await NotificationService.sendPasswordResetEmail(customerName, email, resetLink);
    } catch (ne) {
      console.error("Failed to send password reset email:", ne);
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to request password reset." };
  }
}
