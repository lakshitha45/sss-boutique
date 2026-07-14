import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const SESSION_COOKIE_NAME = "sss_boutique_session";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code && isSupabaseConfigured() && supabase) {
    try {
      // Exchange code for session using the supabase client
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error && data?.user) {
        // Query profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        let finalProfile = profile;

        if (!profile) {
          // Auto-create profile if missing
          const fullName = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Customer";
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              role: "customer",
            })
            .select()
            .single();

          if (!insertError) {
            finalProfile = newProfile;
          }
        }

        const userProfile = {
          id: data.user.id,
          email: data.user.email || "",
          fullName: finalProfile?.full_name || data.user.user_metadata?.full_name || "Customer",
          role: finalProfile?.role || "customer",
          createdAt: data.user.created_at,
        };

        // Save session cookie
        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(userProfile), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
      }
    } catch (err) {
      console.error("OAuth callback exchange failed:", err);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
