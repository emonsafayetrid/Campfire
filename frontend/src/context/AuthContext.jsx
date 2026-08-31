import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
  refreshAccessToken,
} from "../api/auth";
import { setAccessToken, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());
  }, [clearSession]);

  useEffect(() => {
    // Try to silently resume a session using the httpOnly refresh cookie.
    const bootstrap = async () => {
      try {
        const res = await refreshAccessToken();
        const token = res.data?.data?.accessToken;
        setAccessToken(token);
        const meRes = await getCurrentUser();
        setUser(meRes.data?.data || null);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { user: loggedInUser, accessToken: token } = res.data.data;
    setAccessToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload) => {
    const res = await registerUser(payload);
    return res.data.data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      clearSession();
    }
  };

  const refreshCurrentUser = async () => {
    const meRes = await getCurrentUser();
    setUser(meRes.data?.data || null);
    return meRes.data?.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        initializing,
        login,
        register,
        logout,
        refreshCurrentUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
