export default class HttpException extends Error {
  statusCode: number; // HTTP status code associated with the error.
  errorCode: string;
  detail: string | undefined;

  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
