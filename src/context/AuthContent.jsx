import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader"; // ✅ Importa el SpinnerLoader

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/me", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("No autorizado");

        const data = await response.json();
        setUser(data.user);
        console.log("✅ Sesión activa:", data.user);
      } catch (error) {
        console.error("❌ Error al verificar sesión:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // 🔄 **Muestra el SpinnerLoader mientras carga**
  if (loading) {
    console.log("⏳ Mostrando SpinnerLoader...");
    return <SpinnerLoader />;
  }

  // 🔐 **Función de login**
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error desconocido");

      console.log("✅ Login exitoso:", data.user);
      setUser(data.user);
      navigate("/Home");
    } catch (error) {
      console.error("❌ Error en login:", error.message);
    }
  };

  // 🚪 **Función de logout**
  const logout = async () => {
    try {
      await fetch("http://localhost:3001/api/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}{" "}
      {/* 🔹 Ahora siempre renderiza `children`, sin bloquearlo con `SpinnerLoader` */}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
