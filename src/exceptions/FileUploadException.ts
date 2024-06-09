import HttpException from "./HttpException";

export default class FileUploadException extends HttpException {
  constructor(message = "Unsupported file format", statusCode = 400) {
    super(message, statusCode);
  }
}
