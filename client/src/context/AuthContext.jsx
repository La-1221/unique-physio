import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
      localStorage.removeItem("upsc_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const handleAuthSuccess = (data) => {
    if (data.token) localStorage.setItem("upsc_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return handleAuthSuccess(data);
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return handleAuthSuccess(data);
  };

  const sendPhoneOtp = async (payload) => {
    const { data } = await api.post("/auth/otp/send", payload);
    return data;
  };

  const verifyPhoneOtp = async (payload) => {
    const { data } = await api.post("/auth/otp/verify", payload);
    return handleAuthSuccess(data);
  };

  const googleLogin = async (payload) => {
    const { data } = await api.post("/auth/google", payload);
    return handleAuthSuccess(data);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("upsc_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        sendPhoneOtp,
        verifyPhoneOtp,
        googleLogin,
        logout,
        refetch: fetchMe
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
