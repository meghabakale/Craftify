import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Plus,
  Cloud,
} from 'lucide-react';
import { uploadImageToCloudinary } from '../../api/uploadImage';
import { CLOUDINARY_CLOUD_NAME } from '../../api/cloudinaryConfig';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageUploadDropzoneProps {
  id?: string;
  label?: string;
  sublabel?: string;
  value: string;
  onChange: (url: string) => void;
  galleryValues?: string[];
  onGalleryChange?: (urls: string[]) => void;
  supportGallery?: boolean;
  warningMessage?: string | null;
  onClearWarning?: () => void;
  className?: string;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  id = 'image-upload-dropzone',
  label = 'Cover Image',
  sublabel = 'Upload a high-resolution workshop photo representing your handcrafted piece (JPG, PNG, WEBP up to 5MB)',
  value,
  onChange,
  galleryValues = [],
  onGalleryChange,
  supportGallery = false,
  warningMessage = null,
  onClearWarning,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadErrorDetail, setUploadErrorDetail] = useState<string | null>(null);

  // Gallery upload state
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Client-side file validation
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file format. Please upload a JPG, PNG, or WEBP image file.',
      };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `File size (${sizeMB}MB) exceeds the 5MB limit. Please select a smaller image.`,
      };
    }
    return { isValid: true };
  };

  const handleProcessUpload = async (file: File) => {
    setUploadError(null);
    setUploadErrorDetail(null);
    if (onClearWarning) onClearWarning();

    // 1. Validate type and size FIRST before uploading
    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    // 2. Uploading in flight
    setIsUploading(true);

    try {
      const secureUrl = await uploadImageToCloudinary(file);
      onChange(secureUrl);
      setUploadError(null);
      setUploadErrorDetail(null);
    } catch (err: unknown) {
      setUploadError("Couldn't upload image — try again");
      if (err instanceof Error) {
        setUploadErrorDetail(err.message);
      } else {
        setUploadErrorDetail('An unknown network error occurred during upload.');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGalleryUpload = async (file: File) => {
    setGalleryError(null);
    const validation = validateFile(file);
    if (!validation.isValid) {
      setGalleryError(validation.error || 'Invalid file');
      return;
    }

    setIsGalleryUploading(true);
    try {
      const secureUrl = await uploadImageToCloudinary(file);
      if (onGalleryChange) {
        onGalleryChange([...galleryValues, secureUrl]);
      }
      setGalleryError(null);
    } catch (err: unknown) {
      setGalleryError("Couldn't upload gallery image — try again");
    } finally {
      setIsGalleryUploading(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessUpload(file);
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleGalleryUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessUpload(file);
    }
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUploadError(null);
    setUploadErrorDetail(null);
  };

  const handleRemoveGalleryImage = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGalleryChange) {
      onGalleryChange(galleryValues.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const isCloudinaryUrl = value.includes('cloudinary.com') || value.includes('res.cloudinary');
  const isCloudinaryConfigured =
    CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME';

  return (
    <div id={id} className={`space-y-3 ${className}`}>
      {/* Header / Labels */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold">
            {label} *
          </label>
          {sublabel && (
            <p className="text-[11px] text-[#878787] mt-0.5">{sublabel}</p>
          )}
        </div>
        {isCloudinaryUrl && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold uppercase tracking-wider">
            <Cloud className="w-3 h-3 text-[#2E7D32]" />
            <span>Cloudinary Hosted</span>
          </span>
        )}
      </div>

      {/* Inline Warning Nudge (if backer submits without cover image) */}
      {warningMessage && !value && (
        <div
          id={`${id}-warning`}
          className="p-3 bg-[#FFF8E7] border border-[#FFE8A3] rounded-[4px] text-xs font-medium text-[#B78103] flex items-center gap-2 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-[#B78103]" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Main Cover Upload Box */}
      {value ? (
        /* UPLOADED STATE: Image Preview with Change / Remove actions */
        <div
          id={`${id}-preview-box`}
          className="relative bg-[#FFFFFF] border border-[#E0E0E0] rounded-[4px] overflow-hidden p-3 shadow-2xs group"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-48 h-36 bg-[#F8FAFC] rounded-[3px] border border-[#E2E8F0] overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={value}
                alt="Uploaded cover preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback icon if broken URL
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute top-1.5 left-1.5 bg-[#212121]/75 text-[#FFFFFF] text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] backdrop-blur-2xs flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#4CAF50]" />
                <span>Uploaded</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#212121] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#388E3C]" />
                  <span>Cover image ready</span>
                </div>
                <p className="text-[11px] text-[#878787] break-all font-mono line-clamp-2">
                  {value}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id={`${id}-change-btn`}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-[2px] bg-[#F1F3F6] hover:bg-[#EAEAEA] text-[#2874F0] border border-[#2874F0]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Change Image</span>
                </button>

                <button
                  type="button"
                  id={`${id}-remove-btn`}
                  onClick={handleRemoveCover}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] hover:bg-[#FFF3EC] text-[#FB641B] border border-[#FB641B]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* IDLE OR UPLOADING DROP ZONE */
        <div
          id={`${id}-dropzone`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`p-6 sm:p-8 border-2 border-dashed rounded-[4px] transition-all text-center flex flex-col items-center justify-center cursor-pointer select-none ${
            isDragOver
              ? 'border-[#2874F0] bg-[#EBF3FE]'
              : uploadError
              ? 'border-[#FB641B]/50 bg-[#FFF3EC]/40 hover:border-[#FB641B]'
              : 'border-[#D5D5D5] bg-[#F9F9F9] hover:border-[#2874F0] hover:bg-[#F1F3F6]'
          }`}
        >
          {isUploading ? (
            /* UPLOADING STATE (Spinner & Progress) */
            <div className="flex flex-col items-center justify-center py-2 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-[#EBF3FE] flex items-center justify-center mb-3">
                <Loader2 className="w-6 h-6 text-[#2874F0] animate-spin" />
              </div>
              <div className="font-bold text-xs text-[#212121] flex items-center gap-1.5">
                <span>Uploading image to Cloudinary...</span>
              </div>
              <p className="text-[11px] text-[#878787] mt-1">
                Optimizing and storing high-resolution asset securely
              </p>
              <div className="w-48 h-1.5 bg-[#E0E0E0] rounded-full overflow-hidden mt-3">
                <div className="h-full bg-[#2874F0] w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          ) : (
            /* IDLE STATE: "Click or drag to upload cover image" */
            <div className="flex flex-col items-center justify-center">
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center mb-3 transition-colors ${
                  isDragOver
                    ? 'bg-[#2874F0] text-[#FFFFFF] border-[#2874F0]'
                    : 'bg-[#FFFFFF] text-[#2874F0] border-[#E0E0E0]'
                }`}
              >
                <Upload className="w-5 h-5" />
              </div>

              <div className="font-bold text-xs text-[#212121]">
                Click or drag to upload cover image
              </div>
              <p className="text-[11px] text-[#878787] mt-1 max-w-sm">
                Supported formats: <strong className="font-semibold text-[#555]">JPG, PNG, WEBP</strong> • Max file size: <strong className="font-semibold text-[#555]">5MB</strong>
              </p>

              <div className="mt-3">
                <span className="inline-block px-3 py-1.5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider shadow-xs hover:bg-[#1C5FD0] transition-colors">
                  Browse Files
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={`${id}-file-input`}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Error Display with Retry */}
      {uploadError && (
        <div
          id={`${id}-error-banner`}
          className="p-3 bg-[#FFF3EC] border border-[#FB641B]/40 rounded-[4px] text-xs text-[#FB641B] flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FB641B]" />
            <div>
              <div className="font-bold">{uploadError}</div>
              {uploadErrorDetail && (
                <div className="text-[11px] text-[#878787] mt-0.5 max-w-xl font-normal">
                  {uploadErrorDetail}
                </div>
              )}
              {!isCloudinaryConfigured && (
                <div className="text-[10px] text-[#2874F0] mt-1 font-mono">
                  Tip: Configure CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in src/api/cloudinaryConfig.ts
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              id={`${id}-retry-btn`}
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-[11px] font-bold uppercase rounded-[2px] transition-colors cursor-pointer"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadError(null);
                setUploadErrorDetail(null);
              }}
              className="text-[11px] text-[#878787] hover:text-[#212121] px-1 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* MULTIPLE IMAGES / GALLERY SUPPORT */}
      {supportGallery && (
        <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-[#212121]">
              Additional Gallery Photos (Optional)
            </span>
            <span className="text-[11px] text-[#878787]">
              {galleryValues.length} uploaded
            </span>
          </div>

          {galleryError && (
            <div className="p-2 bg-[#FFF3EC] border border-[#FB641B]/30 rounded-[2px] text-xs text-[#FB641B] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{galleryError}</span>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {galleryValues.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-[3px] border border-[#E0E0E0] overflow-hidden group bg-[#FAFAFA]"
              >
                <img
                  src={imgUrl}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => handleRemoveGalleryImage(idx, e)}
                  className="absolute top-1 right-1 p-1 bg-[#212121]/80 hover:bg-[#FB641B] text-[#FFFFFF] rounded-[2px] opacity-90 transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add Gallery Photo Button */}
            <button
              type="button"
              id={`${id}-add-gallery-btn`}
              onClick={() => galleryInputRef.current?.click()}
              disabled={isGalleryUploading}
              className="aspect-square rounded-[3px] border border-dashed border-[#D5D5D5] hover:border-[#2874F0] bg-[#F9F9F9] hover:bg-[#F1F3F6] flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer"
            >
              {isGalleryUploading ? (
                <Loader2 className="w-4 h-4 text-[#2874F0] animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#2874F0] mb-0.5" />
                  <span className="text-[10px] font-bold text-[#2874F0] leading-tight">
                    Add Photo
                  </span>
                </>
              )}
            </button>
          </div>

          <input
            ref={galleryInputRef}
            id={`${id}-gallery-file-input`}
            type="file"
            accept={ALLOWED_MIME_TYPES.join(',')}
            className="hidden"
            onChange={handleGalleryFileChange}
          />
        </div>
      )}
    </div>
  );
};
