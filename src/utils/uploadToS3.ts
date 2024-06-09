import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  BACKEND_URL,
  S3_ACCESS_KEY_ID,
  S3_BUCKET_NAME,
  S3_ENDPOINT,
  S3_FORCE_STYLE,
  S3_REGION,
  S3_SECRET_ACCESS_KEY,
} from "../configs";
import FileUploadException from "../exceptions/FileUploadException";

const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: Boolean(S3_FORCE_STYLE),
});

export const uploadToS3 = async (key: string, body: Buffer, file: any) => {
  try {
    const uploadParams: PutObjectCommandInput = {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ACL: "public-read",
      ContentEncoding: "buffer",
      ContentType: file.mimetype,
      Metadata: { fieldName: file.fieldname },
    };
    await s3.send(new PutObjectCommand(uploadParams));
    return `${BACKEND_URL}:9000/${S3_BUCKET_NAME}/${key}`;
  } catch (error) {
    throw new FileUploadException(
      "File upload failed due to an unexpected error"
    );
  }
};
