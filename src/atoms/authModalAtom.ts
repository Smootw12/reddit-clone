import { atom } from "recoil";

export interface AuthModalState {
  open: boolean;
  view: "login" | "signup" | "resetPassword";
  error: string | undefined;
}

export const authModalState = atom<AuthModalState>({
  key: "authModalState",
  default: {
    open: false,
    view: "login",
    error: "",
  },
});
