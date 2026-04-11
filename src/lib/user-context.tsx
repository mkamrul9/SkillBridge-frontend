"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getApiBaseUrl } from "./api-url";
import { toast } from "sonner";

type UserType = any | null;
type UserContextType = {
  user: UserType;
  setUser: (u: UserType) => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: (_user: UserType) => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const base = getApiBaseUrl();
    const url = base.endsWith("/api")
      ? `${base}/user/me`
      : `${base}/api/user/me`;
    fetch(url, { credentials: "include" })
      .then(async (res) => {
        if (res.status === 403) {
          // User is banned
          const data = await res.json();
          toast.error(data.message || "Your account has been banned");
          setUser(null);
          localStorage.removeItem('token');
          return Promise.reject("Banned");
        }
        if (res.status === 401) {
          // Not authenticated - clear any stale data
          console.log('[UserContext] 401 - clearing stale auth data');
          localStorage.removeItem('token');
          return Promise.reject("Not authenticated");
        }
        return res.ok ? res.json() : Promise.reject("Not authenticated");
      })
      .then((data) => setUser(data.data))
      .catch((err) => {
        if (err !== "Banned") {
          setUser(null);
        }
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
