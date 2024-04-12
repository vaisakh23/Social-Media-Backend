import HttpException from "./HttpException";

export default class UnauthorizedException extends HttpException {
  constructor(message = 'Authentication failed', statusCode = 401) {
      super(message, statusCode);
  }
}