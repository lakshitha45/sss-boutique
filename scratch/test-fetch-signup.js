const supabaseUrl = "https://diyqjfjxyivhcsbnjcfx.supabase.co";
const jwtAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXFqZmp4eWl2aGNzYm5qY2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTM0MTUsImV4cCI6MjA5OTU4OTQxNX0.WoYin1--9_5WVRyD-cSJuOyRjzXL6RBVx4U7qHLNseU";

async function run() {
  const randomEmail = `testuser_${Math.floor(Math.random() * 100000)}@gmail.com`;
  console.log(`Testing native fetch POST to signUp with random email: ${randomEmail}...`);
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "apikey": jwtAnonKey,
        "Authorization": `Bearer ${jwtAnonKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: randomEmail,
        password: "defaultPassword123!",
        data: {
          full_name: "Test User",
          role: "customer"
        }
      })
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
