import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { processImage } from "../utils/processImage";
import { uploadToS3 } from "../utils/uploadToS3";

const upload = multer();

// Function to generate a hashed key for the file
const generateHashedKey = (originalname: string): string => {
  const timestamp = Date.now().toString();
  const hash = crypto
    .createHash("sha256")
    .update(originalname + timestamp)
    .digest("hex");
  const fileExtension = originalname.split(".").pop();
  return `${hash}.${fileExtension}`;
};

const uploadMiddleware = (method: string, ...args: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (upload as any)[method](...args)(req, res, async function (err: any) {
      if (err) return next(err);

      // Utility function to process and upload a image
      const processAndUploadImage = async (file: any): Promise<any> => {
        const processedBuffer = await processImage(file.buffer, file.mimetype);
        const key = generateHashedKey(file.originalname);
        return await uploadToS3(key, processedBuffer, file);
      };

      // Multiple files
      if (req.files) {
        req.files = await Promise.all(
          (req.files as any).map(processAndUploadImage)
        );
      }
      // single file
      if (req.file) {
        req.file = await processAndUploadImage(req.file as any);
      }
      next();
    });
  };
};

export default uploadMiddleware;
