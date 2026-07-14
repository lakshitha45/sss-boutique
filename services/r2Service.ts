/**
 * Cloudflare R2 Asset Upload Service
 * 
 * Provides integration helper functions to store and retrieve binary images
 * and designer catalogs inside Cloudflare R2 Object Storage buckets.
 */

interface UploadResult {
  success: boolean;
  url: string;
  key: string;
  error?: string;
}

export const isR2Configured = (): boolean => {
  return (
    process.env.R2_ACCESS_KEY_ID !== undefined &&
    process.env.R2_SECRET_ACCESS_KEY !== undefined &&
    process.env.R2_BUCKET_NAME !== undefined
  );
};

/**
 * Uploads a file asset to Cloudflare R2 bucket.
 * Falls back to a mock file reader path returned as simulated local preview URL if R2 credentials are not set.
 */
export async function uploadAsset(
  file: File,
  path: string
): Promise<UploadResult> {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const key = `${path}/${fileName}`.replace(/\/+/g, "/");

  if (!isR2Configured()) {
    // Mock Mode upload simulated delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Generate a temporary mock url representing the file
    // In local sandbox client environment we return base64 URL or Unsplash simulation
    const mockUrl = `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop`;
    return {
      success: true,
      url: mockUrl,
      key,
    };
  }

  try {
    // Direct R2 bucket signature endpoint or S3 compatible putObject call
    // Typically executed via server action/api route
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      key,
    };
  } catch (err: any) {
    return {
      success: false,
      url: "",
      key,
      error: err.message || "An unexpected error occurred during Cloudflare R2 upload.",
    };
  }
}
