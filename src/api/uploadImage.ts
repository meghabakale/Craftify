import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './cloudinaryConfig';

/**
 * Uploads an image file to Cloudinary using an unsigned upload preset.
 * 
 * @param file - The image file to upload (JPEG, PNG, WEBP)
 * @returns Promise resolving to the Cloudinary secure_url string (HTTPS)
 * @throws Error on upload failure or missing configuration
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // Fallback to HTTP status message
      }

      if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME' || CLOUDINARY_UPLOAD_PRESET === 'YOUR_UPLOAD_PRESET') {
        errorMessage = `Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in src/api/cloudinaryConfig.ts. (${errorMessage})`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('Cloudinary response did not include a secure_url');
    }

    return data.secure_url;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Unexpected error occurred during Cloudinary upload');
  }
}
