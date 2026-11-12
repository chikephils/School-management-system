import { AxiosError } from "axios";

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export function getApiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiErrorResponse | undefined;

    if (Array.isArray(responseData?.message)) {
      return responseData.message[0] ?? "Request failed";
    }
    return responseData?.message ?? responseData?.error ?? "Request failed";
  }
  return "Something went wrong";
}
