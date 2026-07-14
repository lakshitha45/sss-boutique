const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://diyqjfjxyivhcsbnjcfx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXFqZmp4eWl2aGNzYm5qY2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTM0MTUsImV4cCI6MjA5OTU4OTQxNX0.WoYin1--9_5WVRyD-cSJuOyRjzXL6RBVx4U7qHLNseU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Listing triggers and functions registered on tables...");
  // Let's try to query the trigger configuration by querying pg_trigger or running rpc
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Query failed:", error);
  } else {
    console.log("Profiles table query succeeded, testing dummy insert to profiles to see if triggers or RLS is working:");
    // Try dummy insert using a random UUID
    const dummyId = "00000000-0000-0000-0000-000000000001";
    const { data: insData, error: insErr } = await supabase
      .from("profiles")
      .insert({
        id: dummyId,
        email: "test@example.com",
        full_name: "Test User",
        role: "customer"
      });
    console.log("Insert data:", insData);
    console.log("Insert error details:", insErr);
  }
}

run();
