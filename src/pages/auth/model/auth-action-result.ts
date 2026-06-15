export type AuthActionResult =
  | {
      status: "error";
      message: string;
      fields?: {
        email?: string;
      };
    }
  | {
      status: "success";
      message: string;
      user: {
        id: number;
        email: string;
        name: string | null;
      };
    };
