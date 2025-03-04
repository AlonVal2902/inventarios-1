import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Header } from "../../index";
import productosApi from "../../apis/productos";
import inventarioApi from "../../apis/inventario";

export function InventariosTemplate() {
  const [state, setState] = useState(false);
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroPresentacion, setFiltroPresentacion] = useState("");

  const handleCloseModal = () => {
    setSelectedProducto(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosResponse, inventariosResponse] = await Promise.all([
          productosApi.findAll(),
          inventarioApi.findAll(),
        ]);

        const productosData = productosResponse?.data || [];
        const inventariosData = inventariosResponse?.data || [];

        const mergedData = productosData.map((producto) => {
          const inventario = inventariosData.find(
            (inv) => inv.idproducto === producto.idproducto
          );
          return {
            ...producto,
            cantidadempaquetado: inventario?.cantidadempaquetado || 0,
          };
        });

        setProductos(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error cargando los productos e inventarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando inventario...</div>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  const productosFiltrados = filtroPresentacion
    ? productos.filter(
        (producto) =>
          producto.presentacion &&
          producto.presentacion.toLowerCase() ===
            filtroPresentacion.toLowerCase()
      )
    : productos;

  return (
    <Container>
      <Header
        stateConfig={{ state, setState: () => setState((prev) => !prev) }}
      />

      <Title>Inventario de Productos</Title>

      <FiltroContainer>
        <label>Filtrar por presentación</label>
        <Select
          value={filtroPresentacion}
          onChange={(e) => setFiltroPresentacion(e.target.value)}
        >
          <Option value="">Todos</Option>
          <Option value="rollo">Rollos</Option>
          <Option value="cono">Conos</Option>
        </Select>
      </FiltroContainer>

      <Grid>
        {productosFiltrados.map((producto) => (
          <Card
            key={producto.idproducto}
            stockStatus={
              producto.cantidadempaquetado > producto.stockseguridad
                ? "in-stock"
                : "low-stock"
            }
            onClick={() => setSelectedProducto(producto)}
            tabIndex="0"
          >
            <h3>{producto.descripcion}</h3>
            <p>
              <strong>Código:</strong> {producto.idproducto}
            </p>
            <p>
              <strong>Stock Mínimo:</strong> {producto.stockseguridad || "N/A"}
            </p>
            <StockText
              isLowStock={
                producto.cantidadempaquetado <= producto.stockseguridad
              }
            >
              <strong>Existencia Actual:</strong>{" "}
              {producto.cantidadempaquetado || "Agotado"}
            </StockText>
          </Card>
        ))}
      </Grid>

      {selectedProducto && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Detalles del Producto</h2>
            <p>
              <strong> {selectedProducto.descripcion}</strong>
            </p>
            <p>
              <strong>ID:</strong> {selectedProducto.idproducto}
            </p>
            <p>
              <strong>Existencia Actual:</strong>{" "}
              {selectedProducto.cantidadempaquetado || "Agotado"}
            </p>
            <p>
              <strong>Stock Mínimo:</strong>{" "}
              {selectedProducto.stockseguridad || "N/A"}
            </p>

            <CloseButton onClick={handleCloseModal}>Cerrar</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  display: flex;
  flex-direction: column;
  display: flex;
  flex-direction: column;

  .header {
    color: rgba(98, 93, 164, 0.14);
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  color: ${(props) => props.theme.text};
  margin-bottom: 20px;
`;

const FiltroContainer = styled.div`
  label {
    font-size: 1.4rem;
    margin-left: 50px;
    margin-top: 6px;
  }
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
`;

const Select = styled.select`
  margin-left: 40px;
  padding: 10px 15px;
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  text-color: black;
  transition: all 0.3s ease-in-out;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;

const Option = styled.option`
  padding: 10px;
  font-size: 1rem;
  background-color: white;
  color: #333;

  &:hover {
    background-color: rgb(118, 162, 209);
    color: "black";
  }
`;

const Grid = styled.div`
  margin-top: 20px;
  margin-left: 50px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
`;

const Card = styled.div`
  background: ${(props) => props.theme.chart};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const StockText = styled.p`
  font-weight: bold;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  color: #000;
  padding: 10px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.3s ease-in-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const CloseButton = styled.button`
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 6px;
  font-weight: bold;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: #cc0000;
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.p`
  color: #d9534f;
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
`;

export default InventariosTemplate;
