import React, { useState, useEffect } from "react";

import salidasApi from "../../apis/salidas.js";
import productosApi from "../../apis/productos.js";
import inventarioApi from "../../apis/inventario.js";
import destinosApi from "../../apis/destino.js";
import styled from "styled-components";
import { Header } from "../../index";

export function SalidasTemplate() {
  const [salidas, setSalidas] = useState([]);
  const [destinos, setDestinos] = useState([]);

  //Los modal y Pop-ups
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [paginaActual, setPaginaActual] = useState(0); // Estado para la página actual
  const registrosPorPagina = 25; // Cantidad de registros por página

  const salidasOrdenadas = [...salidas].sort(
    (a, b) => b.idregistro - a.idregistro
  );

  const [searchDescripcion, setSearchDescripcion] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const buscarProductosPorDescripcion = async (descripcion) => {
    if (!descripcion.trim()) {
      setProductosFiltrados([]);
      return;
    }

    try {
      const response = await productosApi.findAll(); // Obtener todos los productos
      if (response?.data) {
        const filtrados = response.data.filter((producto) =>
          producto.descripcion.toLowerCase().includes(descripcion.toLowerCase())
        );
        setProductosFiltrados(filtrados);
      }
    } catch (error) {
      console.error("Error buscando productos:", error);
      setProductosFiltrados([]);
    }
  };

  // Función para avanzar a la siguiente página
  const avanzarPagina = () => {
    const maxPaginas = Math.ceil(salidasOrdenadas.length / registrosPorPagina);
    if (paginaActual < maxPaginas - 1) {
      setPaginaActual(paginaActual + 1);
    }
  };

  // Función para retroceder a la página anterior
  const retrocederPagina = () => {
    if (paginaActual > 0) {
      setPaginaActual(paginaActual - 1);
    }
  };

  // Calcular los registros que se mostrarán en la página actual
  const inicio = paginaActual * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const registrosActuales = salidasOrdenadas.slice(inicio, fin);
  const maxPaginas = Math.ceil(salidasOrdenadas.length / registrosPorPagina);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    idproducto: "",
    descripcion: "",
    tipo: "",
    cantidad: "",
    trama: "",
    tamaño: "",
    presentacion: "",
    empaquetado: "",
    cantidadempaquetado: "",
    peso: "",
    metros: "",
    destino: "",
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [state, setState] = useState(false);
  //fetch destinos

  useEffect(() => {
    const fetchDestinos = async () => {
      try {
        const response = await destinosApi.findAll();
        setDestinos(response?.data || []);
      } catch (error) {
        console.error("Error fetching destinos:", error);
        setError("Error fetching destinos.");
      } finally {
        setLoading(false);
      }
    };
    fetchDestinos();
  }, []);

  // Fetch salidas
  useEffect(() => {
    const fetchSalidas = async () => {
      try {
        const response = await salidasApi.findAll();
        setSalidas(response?.data || []);
      } catch (error) {
        console.error("Error fetching entries:", error);
        setError("Error fetching entries.");
      } finally {
        setLoading(false);
      }
    };
    fetchSalidas();
  }, []);

  // Fetch product by idproducto
  const buscarProducto = async (idproducto) => {
    if (!idproducto) {
      console.warn("Codigo is required to fetch a product.");
      return;
    }

    try {
      const response = await productosApi.findOne(idproducto);
      if (response?.data) {
        const producto = response.data;
        setFormData((prev) => ({
          ...prev,
          descripcion: producto.descripcion || "No description available",
          tipo: producto.tipo || "",
          tamaño: producto.tamaño || "",
          trama: producto.trama || "",
          presentacion: producto.presentacion || "",
          peso: producto.peso || "",
          metros: producto.metros || "",
          color: producto.color || "",
          diseño: producto.diseño || "",
        }));
      } else {
        console.warn(`No product found for idproducto: ${idproducto}`);
        setFormData((prev) => ({
          ...prev,
          descripcion: "No product found",
        }));
      }
    } catch (error) {
      console.error("Error fetching product by idproducto:", error);
      setFormData((prev) => ({
        ...prev,
        descripcion: "Error fetching product",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "idproducto") {
      const trimmedValue = value.slice(0, 13); // Limitar a 13 caracteres
      setFormData((prev) => ({ ...prev, [name]: trimmedValue })); // Actualiza el estado con el valor recortado

      if (trimmedValue.length === 13) {
        buscarProducto(trimmedValue); // Llamar a buscarProducto solo si tiene 13 caracteres
      }
    }
  };

  const handleRegister = async () => {
    const { idproducto, descripcion, cantidad, empaquetado, destino, diseño } =
      formData;

    if (!idproducto || !cantidad || !empaquetado || !destino) {
      alert("Please fill in all required fields.");
      return;
    }

    if (parseInt(cantidad, 10) <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    const newSalida = {
      ...formData,
      mes: new Date().toISOString().split("T")[0],
      cantidadempaquetado: parseInt(cantidad, 10),
      peso: parseFloat(formData.peso) || 0,
      metros: parseFloat(formData.metros) || 0,
      color: formData.color || "",
      diseño: diseño || "",
      idestino: formData.destino || "",
    };

    try {
      await salidasApi.create(newSalida);
      alert("Producto registrado");
      setSalidas((prev) => [...prev, newSalida]);
      clearForm();
      restarInventario(idproducto);
    } catch (error) {
      console.error("Error al registrar el producto", error);
      alert("Error al registrar.");
    }
  };

  const restarInventario = async (idproducto) => {
    try {
      const inventario = await inventarioApi.findOne(idproducto);

      if (inventario && inventario.data) {
        const cantidadActual =
          parseInt(inventario.data.cantidadempaquetado, 10) || 0;
        const cantidadRestar = parseInt(formData.cantidad, 10) || 0;
        const nuevaCantidad = cantidadActual - cantidadRestar;

        if (nuevaCantidad < 0) {
          alert("Insufficient inventory.");
          return;
        }

        await inventarioApi.update(idproducto, {
          cantidadempaquetado: nuevaCantidad,
        });
        alert("Inventory updated successfully.");
      } else {
        alert("Product not found in inventory.");
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert("Error updating inventory.");
    }
  };

  const clearForm = () => {
    setFormData({
      idproducto: "",
      descripcion: "",
      tipo: "",
      cantidad: "",
      trama: "",
      presentacion: "",
      empaquetado: "",
      cantidadempaquetado: "",
      peso: "",
      metros: "",
      color: "",
      diseño: "",
      destino: "",
    });

    setSearchDescripcion(""); // Limpiar la barra de búsqueda
  };
  const openDetails = (salida) => setSelectedProduct(salida);
  const closeDetails = () => setSelectedProduct(null);

  if (loading) return <div>Loading entries...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
        />
      </header>

      <MainSection>
        <h1
          style={{
            fontSize: "28px",
            marginLeft: "30px",
            marginBottom: "25px",
            marginTop: "25px",
          }}
        >
          Salidas
        </h1>
        <Form>
          <Label>
            Código:
            <Input
              type="text"
              name="idproducto"
              value={formData.idproducto}
              onChange={(e) => {
                handleInputChange(e);
                setSearchDescripcion(e.target.value); // Se asigna el valor ingresado
              }}
              placeholder="Buscar por código"
            />
          </Label>

          <Label>
            Descripción:
            <Input
              type="text"
              value={formData.descripcion || searchDescripcion} // Usa formData.descripcion si existe, sino usa searchDescripcion
              onChange={(e) => {
                setSearchDescripcion(e.target.value);
                buscarProductosPorDescripcion(e.target.value);
              }}
              placeholder="Buscar por descripción"
            />
            {/* Mostrar sugerencias de productos */}
            {productosFiltrados.length > 0 && (
              <ul
                style={{
                  color: "#000",
                  border: "1px solid #ccc",
                  listStyle: "none",
                  padding: "5px",
                  position: "absolute",
                  background: "#fff",
                  width: "100%",
                  maxHeight: "150px",
                  overflowY: "auto",
                  zIndex: 10,
                }}
              >
                {productosFiltrados.map((producto) => (
                  <li
                    key={producto.idproducto}
                    style={{
                      padding: "5px",
                      cursor: "pointer",
                      borderBottom: "1px solid #ddd",
                    }}
                    onClick={() => {
                      setSearchDescripcion(producto.descripcion); // Llenar la barra de búsqueda
                      setProductosFiltrados([]); // Ocultar sugerencias después de la selección
                      setFormData((prev) => ({
                        ...prev,
                        idproducto: producto.idproducto,
                        descripcion: producto.descripcion || "",
                        tipo: producto.tipo || "",
                        tamaño: producto.tamaño || "",
                        trama: producto.trama || "",
                        presentacion: producto.presentacion || "",
                        peso: producto.peso || "",
                        metros: producto.metros || "",
                        color: producto.color || "",
                        diseño: producto.diseño || "",
                      }));
                    }}
                  >
                    {producto.descripcion}
                  </li>
                ))}
              </ul>
            )}
          </Label>
          <Label>
            Cantidad:
            <Input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleInputChange}
              min="1"
            />
          </Label>
          <Label>
            Empaquetado:
            <Select
              name="empaquetado"
              value={formData.empaquetado}
              onChange={handleInputChange}
            >
              <option value="">Seleccionar el empaquetado </option>
              <option value="CAJA">Caja</option>
              <option value="BOLSA">Bolsa</option>
            </Select>
          </Label>

          <Label>
            Destino:
            <Select
              name="destino"
              value={formData.destino}
              onChange={handleInputChange} // Manejar el cambio
            >
              {/* Opción predeterminada */}
              <option value="" disabled>
                Seleccionar destino
              </option>

              {/* Mostrar destinos obtenidos desde la API */}
              {destinos.length > 0 ? (
                destinos.map((destino) => (
                  <option key={destino.iddestino} value={destino.iddestino}>
                    {destino.descripcion}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No hay destinos disponibles
                </option>
              )}
            </Select>
          </Label>

          <ButtonsContainer>
            <Button onClick={handleRegister}>Registrar</Button>
            <Button onClick={clearForm}>Limpiar</Button>
          </ButtonsContainer>
          <Table style={{ marginTop: "50px" }}>
            <thead
              style={{
                textAlign: "center", // Alinea el contenido de todas las celdas a la izquierda
                backgroundColor: "#3f3f5e",
              }}
            >
              <tr>
                <th style={{ padding: "70 160px" }}>Descripción</th>
                <th style={{ padding: "70 160px" }}>Fecha</th>
                <th style={{ padding: "70 160px" }}>Cantidad (unid.)</th>
                <th style={{ padding: "70 160px" }}>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {registrosActuales.length === 0 ? (
                <tr>
                  <td colSpan="4">No hay registros disponibles</td>
                </tr>
              ) : (
                registrosActuales.map((entrada, index) => (
                  <tr key={index}>
                    <td style={{ padding: "70 140px" }}>
                      {entrada.descripcion}
                    </td>
                    <td style={{ padding: "70 140px" }}>{entrada.mes}</td>
                    <td style={{ padding: "70 140px" }}>
                      {entrada.cantidadempaquetado}
                    </td>
                    <td style={{ padding: "70 140px" }}>
                      <Button onClick={() => openDetails(entrada)}>
                        Detalles
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div style={{ textAlign: "center" }}>
            <ButtonStyle
              onClick={retrocederPagina}
              disabled={paginaActual === 0}
            >
              Anterior
            </ButtonStyle>
            <span style={{ fontWeight: "bold" }}>
              Página {paginaActual + 1} de {maxPaginas}
            </span>
            <ButtonStyle
              onClick={avanzarPagina}
              disabled={paginaActual === maxPaginas - 1}
              style={{ marginLeft: "22px" }}
            >
              Siguiente
            </ButtonStyle>
          </div>
        </Form>
      </MainSection>

      {selectedProduct && (
        <Modal>
          <ModalContent>
            <h2>{selectedProduct.descripcion}</h2>
            <p>
              <strong>N° registro:</strong> {selectedProduct.idregistro}
            </p>
            <p>
              <strong>Fecha:</strong> {selectedProduct.mes}
            </p>
            <p>
              <strong>Cantidad:</strong> {selectedProduct.cantidadempaquetado}{" "}
              unidades
            </p>
            <CloseButton onClick={closeDetails}>Close</CloseButton>
          </ModalContent>
        </Modal>
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
`;

const MainSection = styled.section`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Form = styled.div`
  background-color: ${(props) => props.theme.body};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const Label = styled.label`
  display: block;
  margin-bottom: 25px;
  color: #f9f9f9;
  font-size: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  color: rgb(15, 15, 15);
  border-radius: 15px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 25px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #45a045;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #2e2e4d;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);

  th {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #444;
    background-color: ${(props) => props.theme.table};
  }
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #444;
    background-color: ${(props) => props.theme.tabletd};
    font-type: bold;
  }

  tr:hover {
    background-color: #1f1f31;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: #fff;
  color: #000;
  padding: 30px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  background-color: "white";
  border: 1px solid #555;
  border-radius: 5px;

  option {
    padding: 10px;
    background-color: "white";
    border: 1px solid #ddd;
  }

  &:focus {
    border-color: rgb(3, 28, 71);
    outline: none;
  }
`;

const CloseButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #d32f2f;
  }
`;

const ButtonStyle = styled.button`
  width: 150px;
  height: 40px;
  margin-top: 40px;
  background-color: rgb(27, 217, 10);
  color: #fff;
  margin: 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: rgb(210, 148, 148);
    cursor: not-allowed;
  }
`;

export default Container;
