import sharp from "sharp";
import FileUploadException from "../exceptions/FileUploadException";

export const processImage = async (
  fileBuffer: Buffer,
  mimetype: string
): Promise<Buffer> => {
  // Determine image format and process accordingly
  let processedBuffer: Buffer;
  const transformer = sharp(fileBuffer).resize(800, 800, {
    fit: sharp.fit.inside,
    withoutEnlargement: true,
  });

  switch (mimetype) {
    case "image/jpeg":
    case "image/jpg":
      processedBuffer = await transformer.jpeg({ quality: 80 }).toBuffer();
      break;
    case "image/png":
      processedBuffer = await transformer
        .png({ compressionLevel: 9 })
        .toBuffer();
      break;
    case "image/webp":
      processedBuffer = await transformer.webp({ quality: 80 }).toBuffer();
      break;
    default:
      throw new FileUploadException(
        `File format '${mimetype}' is not supported`
      );
  }

  return processedBuffer;
};
