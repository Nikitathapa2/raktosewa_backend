import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const maxSize: number = 50 * 1024 * 1024; // 2MB
const maxVideoSize: number = 50 * 1024 * 1024; // 50MB

const ensureFolderExists = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const allowedVideoExtensions = ['.mp4', '.avi', '.mov', '.wmv'];
const allowedVideoMimeTypes = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-ms-wmv'];

const mimeToExtensionMap: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/x-msvideo': '.avi',
  'video/quicktime': '.mov',
  'video/x-ms-wmv': '.wmv',
};

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void => {
    let folder = '';

    if (file.fieldname === 'profilePicture') {
      folder = path.join('public', 'profile_pictures');
    } else if (file.fieldname === 'itemPhoto') {
      folder = path.join('public', 'item_photos');
    } else if (file.fieldname === 'itemVideo') {
      folder = path.join('public', 'item_videos');
    } else if (file.fieldname === 'campaignImage') {
      folder = path.join('public', 'campaigns');
    } else {
      cb(new Error('Invalid field name for upload.'), '');
      return;
    }

    ensureFolderExists(folder);
    cb(null, folder);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ): void => {
    const ext = path.extname(file.originalname) || mimeToExtensionMap[file.mimetype] || '';
    let prefix = 'file';
    if (file.fieldname === 'profilePicture') prefix = 'pro-pic';
    else if (file.fieldname === 'itemPhoto') prefix = 'itm-pic';
    else if (file.fieldname === 'itemVideo') prefix = 'item-vid';
    else if (file.fieldname === 'campaignImage') prefix = 'campaign';

    cb(null, `${prefix}-${Date.now()}${ext}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const normalizedMimeType = (file.mimetype || '').toLowerCase();
  const extension = path.extname(file.originalname || '').toLowerCase();

  if (file.fieldname === 'itemVideo') {
    const hasValidVideoExtension = allowedVideoExtensions.includes(extension);
    const hasValidVideoMimeType = allowedVideoMimeTypes.includes(normalizedMimeType);

    if (!hasValidVideoExtension && !hasValidVideoMimeType) {
      cb(new Error('Video format not supported.'));
      return;
    }
    cb(null, true);
  } else if (
    file.fieldname === 'profilePicture' ||
    file.fieldname === 'itemPhoto' ||
    file.fieldname === 'campaignImage'
  ) {
    const hasValidImageExtension = allowedImageExtensions.includes(extension);
    const hasValidImageMimeType = allowedImageMimeTypes.includes(normalizedMimeType);

    if (!hasValidImageExtension && !hasValidImageMimeType) {
      cb(new Error('Image format not supported.'));
      return;
    }
    cb(null, true);
  } else {
    cb(new Error('Invalid field name for upload.'));
  }
};

// For images (profile pictures and item photos)
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

// For videos (item videos)
export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxVideoSize },
});

// Export single upload for backward compatibility
export default uploadImage;
