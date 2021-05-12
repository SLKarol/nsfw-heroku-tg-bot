export type ResponseError = {
  status: boolean;
  validationErrors: {
    value: string;
    msg: string;
    param: string;
    location: string;
  }[];
};
export function isError(val: unknown): val is ResponseError {
  return (val as ResponseError).validationErrors !== undefined;
}
