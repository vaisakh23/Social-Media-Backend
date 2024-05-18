import HttpException from "./HttpException";

export default class PermissionException extends HttpException {
  constructor(message = "Permission denied", statusCode = 403) {
    super(message, statusCode);
  }
}
