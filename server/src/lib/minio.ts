import { Client as MinioClient } from 'minio';

const globalForMinio = globalThis as unknown as { minio: MinioClient };

export const minio = globalForMinio.minio || new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

if (process.env.NODE_ENV !== 'production') globalForMinio.minio = minio;

const BUCKET = process.env.MINIO_BUCKET || 'adamae';

export async function ensureBucket() {
  const exists = await minio.bucketExists(BUCKET);
  if (!exists) {
    await minio.makeBucket(BUCKET, 'us-east-1');
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET}/*`],
        },
      ],
    };
    await minio.setBucketPolicy(BUCKET, JSON.stringify(policy));
  }
  return BUCKET;
}

export function getObjectUrl(objectName: string): string {
  const publicUrl = process.env.MINIO_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${objectName}`;
  }
  return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${BUCKET}/${objectName}`;
}

export async function uploadFile(
  objectName: string,
  filePath: string,
  metaData?: Record<string, string>
) {
  await ensureBucket();
  await minio.fPutObject(BUCKET, objectName, filePath, metaData);
  return getObjectUrl(objectName);
}

export async function uploadBuffer(
  objectName: string,
  buffer: Buffer,
  contentType: string,
  metaData?: Record<string, string>
) {
  await ensureBucket();
  await minio.putObject(BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': contentType,
    ...metaData,
  });
  return getObjectUrl(objectName);
}

export async function deleteFile(objectName: string) {
  await minio.removeObject(BUCKET, objectName);
}

export async function getPresignedUrl(
  objectName: string,
  expiry: number = 3600
): Promise<string> {
  await ensureBucket();
  return minio.presignedGetObject(BUCKET, objectName, expiry);
}

export async function getPresignedPutUrl(
  objectName: string,
  expiry: number = 3600
): Promise<string> {
  await ensureBucket();
  return minio.presignedPutObject(BUCKET, objectName, expiry);
}

export async function listObjects(prefix: string = '', recursive: boolean = true) {
  await ensureBucket();
  const objects: any[] = [];
  const stream = minio.listObjects(BUCKET, prefix, recursive);
  for await (const obj of stream) {
    objects.push(obj);
  }
  return objects;
}

export { BUCKET };