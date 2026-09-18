// Replace with your own Cloudinary cloud name and unsigned upload preset from cloudinary.com → Settings → Upload.
export const CLOUDINARY_CLOUD_NAME =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CLOUDINARY_CLOUD_NAME) ||
  'YOUR_CLOUD_NAME';

export const CLOUDINARY_UPLOAD_PRESET =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CLOUDINARY_UPLOAD_PRESET) ||
  'YOUR_UPLOAD_PRESET';

