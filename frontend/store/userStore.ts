import { create } from "zustand";
import type { User } from "@/types";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  isPremium: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isPremium: () => {
    const user = get().user;
    if (!user) return false;
    if (!user.premium) return false;
    if (user.premiumExpiresAt) {
      return new Date(user.premiumExpiresAt) > new Date();
    }
    return user.premium;
  },
}));

