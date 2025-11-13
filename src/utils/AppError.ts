export class AppError extends Error {
  public error: any;
  public status: number;
  public statusCode: number;

  constructor({
    error,
    message = "Something went wrong",
    status = 500,
    statusCode = 0,
  }: {
    error: string;
    message?: string;
    status?: number;
    statusCode?: number;
  }) {
    super(message);
    this.error = error;
    this.status = status;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
