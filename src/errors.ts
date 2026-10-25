export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export class ValidationError extends Error {
  constructor(public errors: { field: string; message: string }[]) {
    super("Validasi gagal");
  }
}