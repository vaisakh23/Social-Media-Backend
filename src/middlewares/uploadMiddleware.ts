import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import {
  S3_ACCESS_KEY_ID,
  S3_BUCKET_NAME,
  S3_ENDPOINT,
  S3_FORCE_STYLE,
  S3_REGION,
  S3_SECRET_ACCESS_KEY,
} from "../configs";

const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: Boolean(S3_FORCE_STYLE),
});

const storage = multerS3({
  s3,
  bucket: S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    cb(null, Date.now().toString());
  },
});

export const upload = multer({ storage });
