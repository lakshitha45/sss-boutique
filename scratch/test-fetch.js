async function run() {
  console.log("Testing native fetch to Supabase Auth health endpoint...");
  try {
    const res = await fetch("https://diyqjfjxyivhcsbnjcfx.supabase.co/auth/v1/health");
    console.log("Status:", res.status);
    console.log("Headers:", [...res.headers.entries()]);
    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
