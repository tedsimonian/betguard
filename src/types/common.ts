export type ServerActionState<TData> =
  | {
      status: "success";
      message: string;
      data?: TData | null;
    }
  | {
      status: "error";
      message: string;
      data?: TData | null;
      errors?: Array<{
        path: string;
        message: string;
      }>;
    }
  | null;
