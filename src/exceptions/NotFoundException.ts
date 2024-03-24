import HttpException from "./HttpException";

export default class NotFoundException extends HttpException {
  constructor(message = "Resource not found", statusCode = 404) {
    super(message, statusCode);
  }
}
