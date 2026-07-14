const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://diyqjfjxyivhcsbnjcfx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXFqZmp4eWl2aGNzYm5qY2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTM0MTUsImV4cCI6MjA5OTU4OTQxNX0.WoYin1--9_5WVRyD-cSJuOyRjzXL6RBVx4U7qHLNseU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Testing signUp with JWT Anon Key...");
  try {
    const { data, error } = await supabase.auth.signUp({
      email: "actionhood.ai@gmail.com",
      password: "defaultPassword123!",
      options: {
        data: {
          full_name: "Actionhood AI",
          role: "customer",
        },
      },
    });

    console.log("data:", JSON.stringify(data, null, 2));
    console.log("error:", error);
  } catch (err) {
    console.error("Catch error:", err);
  }
}

run();
