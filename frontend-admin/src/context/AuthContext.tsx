"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

type User = {
  id: string;
  email: string;
  username?: string;
  role: string;
  profile?: {
    fullName: string;
    avatarUrl?: string;
    coverUrl?: string;
    tagline?: string;
    bio?: string;
    city?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    youtubeUrl?: string;
  };
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("nla_access_token");
      localStorage.removeItem("nla_user");
    }
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await fetchApi("/auth/me");
      if (res.data) {
        setUser(res.data);
      }
    } catch (error) {
      console.error("Failed to refresh user", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("nla_access_token") : null;
      if (token) {
        try {
          const res = await fetchApi("/auth/me");
          if (res.data.role === 'ADMIN' || res.data.role === 'SUPER_ADMIN') {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("nla_access_token", token);
      localStorage.setItem("nla_user", JSON.stringify(userData));
    }
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
