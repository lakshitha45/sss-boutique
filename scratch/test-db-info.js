const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://diyqjfjxyivhcsbnjcfx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXFqZmp4eWl2aGNzYm5qY2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTM0MTUsImV4cCI6MjA5OTU4OTQxNX0.WoYin1--9_5WVRyD-cSJuOyRjzXL6RBVx4U7qHLNseU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Inspecting columns of profiles table...");
  const { data, error } = await supabase.rpc("get_profiles_schema");
  if (error) {
    console.log("RPC get_profiles_schema failed, falling back to direct SQL execution via REST query API...");
    // Since RPC might not exist, we try a direct REST call to get column info or select dummy row
    const { data: cols, error: err2 } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);
    console.log("profiles columns check:", cols);
    console.log("error check:", err2);
  } else {
    console.log("Schema data:", data);
  }
}

run();
