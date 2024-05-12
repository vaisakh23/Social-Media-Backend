import { config } from "dotenv";
config();

export const {
  BACKEND_URL = "http://localhost",
  PORT = 8085,
  DB_URL = "mongodb://localhost/database",
  SECRET_KEY = "secretKey",
  ACCESS_TOKEN_SECRET = "secretKey",
  REFRESH_TOKEN_SECRET = "secretKey",
  ACCESS_TOKEN_TIMOUT = "3d",
  REFRESH_TOKEN_TIMOUT = "3d",
  LOG_LEVEL = "info",
  S3_ENDPOINT,
  S3_REGION = "",
  S3_ACCESS_KEY_ID = "",
  S3_SECRET_ACCESS_KEY = "",
  S3_REGION_NAME,
  S3_BUCKET_NAME = "dev-multer-s3-bucket",
  S3_SSL,
  S3_FORCE_STYLE,
} = process.env;
