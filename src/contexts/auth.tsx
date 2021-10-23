import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

interface AuthProvider {
  children: ReactNode;
}

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
};

interface AuthContext {
  user: User | null;
  signInUrl: string;
  signOut: () => void;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  };
}

export const AuthContext = createContext({} as AuthContext);

export function AuthProvider({ children }: AuthProvider) {
  const [user, setUser] = useState<User | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=*****************`;

  const signIn = async (githubCode: string) => {
    const response = await api.post<AuthResponse>("authenticate", {
      code: githubCode,
    });

    const { token, user } = response.data;

    localStorage.setItem("@dowhile:token", token);

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("@dowhile:token");
  };

  useEffect(() => {
    const token = localStorage.getItem("@dowhile:token");

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<User>("profile").then((response) => {
        setUser(response.data);
      });
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;

    const hasGitHubAcessCode = url.includes("?code=");

    if (hasGitHubAcessCode) {
      const [fullUrl, acessCode] = url.split("?code=");

      window.history.pushState({}, "", fullUrl);

      signIn(acessCode);
    }
  }, []);
  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
