import HttpException from "../exceptions/HttpException";

export default class ApiResponse {
  static success<T>(results: T, statusCode: number) {
    return {
      success: true,
      code: statusCode,
      data: results,
    };
  }

  static error(error: HttpException) {
    return {
      success: false,
      code: error.statusCode,
      error: error.errorCode,
      message: error.message,
    };
  }

  static validation(errors: any[]) {
    return {
      success: false,
      code: 422,
      message: "Validation error",
      errors,
    };
  }
}
