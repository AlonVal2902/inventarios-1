import { Routes, Route } from "react-router-dom";
import {
  Login,
  Home,
  ProtectedRoute,
  Entradas,
  Salidas,
  Inventarios,
} from "../index";
import { Layout } from "../hooks/Layout";

export function MyRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <ProtectedRoute accessBy="non-authenticated">
            <Login />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Home"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/entradas"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Entradas />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/salidas"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Salidas />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventarios"
        element={
          <ProtectedRoute accessBy="authenticated">
            <Layout>
              <Inventarios />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
