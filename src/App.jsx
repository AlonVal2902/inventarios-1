import { MyRoutes, Light, Dark, AuthContextProvider } from "./index";
import { createContext, useState } from "react";
import { ThemeProvider } from "styled-components";
import { UserAuth } from "./context/AuthContent";
import { SpinnerLoader } from "./components/moleculas/SpinnerLoader";

export const ThemeContext = createContext(null);

function App() {
  const [themeuse, setTheme] = useState("dark");
  const theme = themeuse === "light" ? Light : Dark;

  return (
    <ThemeContext.Provider value={{ theme: themeuse, setTheme }}>
      <ThemeProvider theme={theme}>
        <AuthContextProvider>
          <AuthLoaderWrapper />{" "}
          {/* 🔹 Aquí se maneja la carga antes de las rutas */}
        </AuthContextProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

function AuthLoaderWrapper() {
  const { loading } = UserAuth();

  return loading ? <SpinnerLoader /> : <MyRoutes />; // ✅ Muestra el spinner solo si está cargando
}

export default App;
