const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://diyqjfjxyivhcsbnjcfx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXFqZmp4eWl2aGNzYm5qY2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTM0MTUsImV4cCI6MjA5OTU4OTQxNX0.WoYin1--9_5WVRyD-cSJuOyRjzXL6RBVx4U7qHLNseU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking database enum type existence...");
  // We can query the pg_type catalog via REST interface if pg_type table is exposed,
  // or we can select typname from pg_type where typname = 'user_role_type'
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .limit(1);

  console.log("profiles select check:", data);
  console.log("error check:", error);
}

run();
