import { supabase } from "@/lib/supabase";

/**
 * Uploads a file directly to the Supabase Storage public bucket "products"
 * with real-time upload progress tracking using XMLHttpRequest.
 * 
 * Falls back to simulated upload progress and placeholder image if Supabase is not configured.
 */
export async function uploadProductImage(
  file: File,
  folderPath: string = "products",
  onProgress?: (percent: number) => void
): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const filePath = `${folderPath}/${fileName}`.replace(/\/+/g, "/");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback to mock simulation if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "placeholder") {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Return a high-quality fashion placeholder image from Unsplash
          resolve(`https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop`);
        }
      }, 80);
    });
  }

  // Get current session token for policy validation
  let token = supabaseAnonKey;
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // Supabase Upload REST Endpoint
    const uploadUrl = `${supabaseUrl}/storage/v1/object/products/${filePath}`;

    xhr.open("POST", uploadUrl, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", supabaseAnonKey);
    xhr.setRequestHeader("x-upsert", "false");

    // Construct FormData body
    const formData = new FormData();
    formData.append("cacheControl", "3600");
    formData.append("file", file);

    // Track upload progress in real-time
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        // Construct the public URL of the uploaded asset
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/products/${filePath}`;
        resolve(publicUrl);
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          reject(new Error(res.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network connection error during Supabase Storage upload."));
    };

    xhr.send(formData);
  });
}
