export type ResponseError = {
  message: string;
  success: boolean;
  validationErrors: {
    value: string;
    msg: string;
    param: string;
    location: string;
  }[];
};
export function isResponseError(val: unknown): val is ResponseError {
  return (val as ResponseError).success !== undefined;
}
