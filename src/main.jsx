import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContent.jsx"; // Importa el AuthContextProvider

export const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          {" "}
          {/* Envuelve la app con el contexto */}
          <App />
        </AuthContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
