import HttpException from "./HttpException";

export default class PermissionExcepton extends HttpException {
  constructor(message = "Permission denied", statusCode = 403) {
    super(message, statusCode);
  }
}
