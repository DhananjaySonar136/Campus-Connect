export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: ApiFieldError[];
  timestamp?: string;
};
