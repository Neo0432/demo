export type DatabaseUserRole = "user" | "admin";

export interface DatabaseUser {
  id: number;
  username: string;
  role: DatabaseUserRole;
  passwordHash: string;
}

