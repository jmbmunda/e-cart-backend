export class AppError extends Error {
  public error: any;
  public status: number;
  public statusCode: number;

  constructor(
    error: string,
    message: string = "Something went wrong",
    status: number = 500,
    statusCode: number = 0
  ) {
    super(message);
    this.error = error;
    this.message = message;
    this.status = status;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
