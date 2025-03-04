import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Device } from "../../styles/breackpoints";
import { Header } from "../../index";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import entradasApi from "../../apis/entradas.js";
import salidasApi from "../../apis/salidas.js";

export function HomeTemplate() {
  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const [state, setState] = useState(false);
  const [dataEntradas, setDataEntradas] = useState([]);
  const [dataSalidas, setDataSalidas] = useState([]);
  const [filteredEntradas, setFilteredEntradas] = useState([]);
  const [filteredSalidas, setFilteredSalidas] = useState([]);
  const [startDate, setStartDate] = useState(localToday);
  const [endDate, setEndDate] = useState(localToday);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EF5"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entradasResponse, salidasResponse] = await Promise.all([
          entradasApi.findAll(),
          salidasApi.findAll(),
        ]);

        setDataEntradas(entradasResponse?.data || []);
        setDataSalidas(salidasResponse?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const filterByDate = (data) =>
        data.filter((item) => item.mes >= startDate && item.mes <= endDate);

      setFilteredEntradas(filterByDate(dataEntradas));
      setFilteredSalidas(filterByDate(dataSalidas));
    } else {
      setFilteredEntradas(dataEntradas);
      setFilteredSalidas(dataSalidas);
    }
  }, [startDate, endDate, dataEntradas, dataSalidas]);

  const aggregateData = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item.idproducto]) {
        acc[item.idproducto] = {
          idproducto: item.idproducto,
          descripcion: item.descripcion,
          totalCantidad: 0,
        };
      }
      acc[item.idproducto].totalCantidad += item.cantidadempaquetado;
      return acc;
    }, {});
  };

  const topEntradas = Object.values(aggregateData(filteredEntradas))
    .sort((a, b) => b.totalCantidad - a.totalCantidad)
    .slice(0, 5);
  const topSalidas = Object.values(aggregateData(filteredSalidas))
    .sort((a, b) => b.totalCantidad - a.totalCantidad)
    .slice(0, 5);

  const aggregatedEntradas = aggregateData(filteredEntradas);
  const aggregatedSalidas = aggregateData(filteredSalidas);
  const allProductIds = new Set([
    ...Object.keys(aggregatedEntradas),
    ...Object.keys(aggregatedSalidas),
  ]);

  if (loading) return <div>Cargando..</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <header className="header">
        <Header stateConfig={{ state, setState: () => setState(!state) }} />
      </header>

      <div className="charts-container">
        <div className="date-filter">
          <h2>Filtrar por rango de fechas</h2>
          <label>
            Desde:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            Hasta:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        <div className="charts-row">
          <div className="chart">
            <h2>Top 5 Productos con Mayor Entrada</h2>
            <PieChart width={400} height={400}>
              <Pie
                data={topEntradas}
                dataKey="totalCantidad"
                nameKey="descripcion"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ descripcion, totalCantidad }) =>
                  `${descripcion} (${totalCantidad})`
                }
              >
                {topEntradas.map((entrada, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="chart">
            <h2>Top 5 Productos con Mayor Salida</h2>
            <PieChart width={400} height={400}>
              <Pie
                data={topSalidas}
                dataKey="totalCantidad"
                nameKey="descripcion"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ descripcion, totalCantidad }) =>
                  `${descripcion} (${totalCantidad})`
                }
              >
                {topSalidas.map((salida, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID Producto</th>
                <th>Descripción</th>
                <th>Total Entrada</th>
                <th>Total Salida</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(allProductIds).map((idproducto) => {
                const entrada = aggregatedEntradas[idproducto] || {
                  totalCantidad: 0,
                  descripcion: "N/A",
                };
                const salida = aggregatedSalidas[idproducto] || {
                  totalCantidad: 0,
                };

                return (
                  <tr key={idproducto}>
                    <td>{idproducto}</td>
                    <td>
                      {entrada.descripcion !== "N/A"
                        ? entrada.descripcion
                        : salida.descripcion || "N/A"}
                    </td>

                    <td>{entrada.totalCantidad}</td>
                    <td>{salida.totalCantidad}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
const Container = styled.div`
  font-family: "Roboto", sans-serif;
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  min-height: 100vh;
  padding: 20px;

  .charts-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: right;
    max-width: 1200px;
    margin: 0 auto;
  }

  .date-filter {
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    background: ${(props) => props.theme.bgtotal};

    text-align: left;
    margin-top: 10px;
    color: ${(props) => props.theme.text};

    width: 100%;
    max-width: 500px;
    position: relative; /* Cambio a relativo para mejor adaptación */

    h2 {
      font-size: 20px;
      color: ${(props) => props.theme.text};
      margin-bottom: 10px;
    }

    label {
      font-weight: bold;
      color: #555;
      display: block;
      margin-top: 10px;
      color: ${(props) => props.theme.text};
    }

    input {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 16px;
    }

    input:focus {
      border-color: #007bff;
      outline: none;
    }
  }

  .charts-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 30px;
    width: 100%;
  }

  .chart {
    background: ${(props) => props.theme.chart};
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;
    max-width: 450px;
    margin-top: 30px;
    width: 100%;
    text-align: center;

    h2 {
      font-size: 22px;
      color: #222;
      margin-bottom: 15px;
      color: ${(props) => props.theme.text};
    }

    &:hover {
      transform: scale(1.05);
    }
  }

  .table-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-x: auto;
    margin-top: 50px;
  }

  table {
    width: 100%;
    min-width: 60%;
    max-width: 90%;
    border-collapse: collapse;
    background: #ffffff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
    margin: 20px 0;
  }

  th,
  td {
    padding: 12px 15px;
    text-align: left;
    font-weight: bold;
  }

  th {
    background: ${(props) => props.theme.table};
    font-weight: bold;
    color: #ffffff;
    font-weight: bold;
    text-transform: uppercase;
  }

  tr {
    border-bottom: 1px solid #ddd;
  }

  tr:hover {
    background-color: #f1f1f1;
  }

  td {
    color: #333;
  }

  /* 📱 Mobile Styles */
  @media ${Device.mobile} {
    .charts-container {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .charts-row {
      flex-direction: column;
      align-items: center;
    }

    .chart {
      max-width: 90%;
    }

    .date-filter {
      max-width: 100%;
      position: relative;
    }

    table {
      min-width: 100%;
    }

    th,
    td {
      padding: 10px;
      font-size: 14px;
    }
  }

  /* 📟 Tablet Styles */
  @media ${Device.tablet} {
    .charts-row {
      flex-direction: row;
      justify-content: space-around;
    }

    .chart {
      max-width: 400px;
    }

    .table-container {
      justify-content: center;
    }

    table {
      min-width: 80%;
    }
  }

  /* 💻 Desktop Styles */
  @media ${Device.desktop} {
    .charts-container {
      align-items: flex-end;
    }

    .chart {
      max-width: 450px;
    }

    table {
      min-width: 60%;
    }
  }
`;

export default Container;
