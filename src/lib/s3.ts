import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

const isMockS3 = 
  !process.env.AWS_ACCESS_KEY_ID || 
  process.env.AWS_ACCESS_KEY_ID === 'your-aws-access-key' ||
  !process.env.S3_BUCKET_NAME ||
  process.env.S3_BUCKET_NAME === 'your-bucket-name';

const s3Client = !isMockS3 ? new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}) : null;

const BUCKET_NAME = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || '';

// Upload file to S3 or fallback to local disk
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (isMockS3) {
    console.log(`[S3 Fallback] Saving file to local public/uploads/${key}`);
    const localDir = path.join(process.cwd(), 'public', 'uploads', path.dirname(key));
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localPath = path.join(process.cwd(), 'public', 'uploads', key);
    fs.writeFileSync(localPath, file);
    return `/uploads/${key}`;
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client!.send(command);
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// Generate signed URL (expires in 1 hour) or return local path directly
export async function getSignedReadUrl(keyOrUrl: string): Promise<string> {
  if (isMockS3 || keyOrUrl.startsWith('/uploads/')) {
    return keyOrUrl;
  }

  let key = keyOrUrl;
  
  // If a full S3 URL is provided, extract the path key
  if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
    try {
      const url = new URL(keyOrUrl);
      // url.pathname starts with "/", we remove it to get the key
      key = decodeURIComponent(url.pathname.substring(1));
    } catch (e) {
      console.error('Failed to parse S3 URL:', e);
    }
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client!, command, {
    expiresIn: 3600, // 1 hour
  });

  return signedUrl;
}

// Helper to generate S3 key for edition
export function getEditionKey(editionId: number, filename: string): string {
  return `editions/${editionId}/${filename}`;
}

// Helper to generate S3 key for book
export function getBookKey(bookId: string, filename: string): string {
  return `books/${bookId}/${filename}`;
}