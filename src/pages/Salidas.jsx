import { useState, useEffect } from "react";
import { SalidasTemplate } from "../index";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";

export function Salidas() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de datos (puedes cambiar esto por una llamada a API real)
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 180)); // Simula un retraso de 2 segundos
      } catch (error) {
        console.error("Error loading inventory data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return loading ? <SpinnerLoader /> : <SalidasTemplate />;
}
