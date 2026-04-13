export class BaseController {
  protected wrapSuccess<T>(data: T): T & { success: boolean } {
    return {
      success: true,
      ...data,
    } as T & { success: boolean };
  }

  protected wrapError<T>(
    message: string,
    data?: Partial<T>,
  ): T & { success: boolean; message: string } {
    return {
      success: false,
      message,
      ...data,
    } as T & { success: boolean; message: string };
  }
}
