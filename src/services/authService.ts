import { api } from "./api";

export type Role = "MOTHER" | "FAMILY" | "GUEST";

export interface UserMe {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  linkedMotherId?: number | null;
}

export const authService = {
  async signup(body: { name: string; email: string; password: string; phone?: string }) {
    const { data } = await api.post<{ token: string; user: UserMe }>("/api/auth/signup", body);
    return data;
  },
  async login(body: { email: string; password: string }) {
    const { data } = await api.post<{ token: string; user: UserMe }>("/api/auth/login", body);
    return data;
  },
  async setRole(role: "MOTHER" | "FAMILY") {
    const { data } = await api.patch<UserMe>("/api/auth/set-role", { role });
    return data;
  },
  async me() {
    const { data } = await api.get<UserMe>("/api/auth/me");
    return data;
  },
};
