import React, { useState } from "react"; // Importar useState desde React
import styled from "styled-components";
import {Header} from "../../index"

export function PlantillaBase() {
  const [state, setState] = useState(false);

  return (
    <Container>
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
        />
      </header>

      <section className="arena1">
        {/* Arena 1 content here */}
      </section>

      <section className="arena2">
        {/* Arena 2 content here */}
      </section>

      <section className="main">
        {/* Main content here */}
      </section>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background-color: ${(props) => props.theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  padding: 15px; /* Añadido padding general al contenedor */
  grid-template-areas:
    "header"
    "arena1"
    "arena2"
    "main";
  grid-template-rows: 100px 100px 100px auto;

  .header {
    grid-area: header;
    background-color: rgba(103, 93, 241, 0.14);
  }

  .arena1 {
    grid-area: arena1;
    background-color: rgba(229, 67, 26, 0.14);
  }

  .arena2 {
    grid-area: arena2;
    background-color: rgba(77, 237, 106, 0.14);
  }

  .main {
    grid-area: main;
    background-color: rgba(179, 46, 241, 0.14);
  }
`;
