import styled from "styled-components";
import { Btnsave, v, InputText, FooterLogin } from "../../index";
import { Device } from "../../styles/breackpoints";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import carrito from "../../assets/carrito.svg";
import logo from "../../assets/inventarioslogo.png";
import { ThemeContext } from "../../App";
import { UserAuth } from "../../context/AuthContent";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Importa los iconos

export function LoginTemplate() {
  const { setTheme } = useContext(ThemeContext);
  const { login } = UserAuth();

  const [errorMessage, setErrorMessage] = useState(""); // Agregado para manejar el mensaje de error
  const [loading, setLoading] = useState(false); // Estado para manejar la carga
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  async function iniciar(data) {
    try {
      setLoading(true); // Activar el estado de carga
      const response = await login(data.usuario, data.pass);

      if (response?.token) {
        localStorage.setItem("authToken", response.token);
        navigate("/Home");
      } else {
        setErrorMessage("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      setErrorMessage(error.message || "Error desconocido");
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  }

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <Container>
      <div className="contentLogo">
        <img src={logo} alt="Logo de Inventarios" />
        <span>Mi Inventario Cavtex</span>
      </div>
      <div className="bannerlateral">
        <img src={carrito} alt="Carrito de compras" />
      </div>

      <div className="contentCard">
        <div className="card">
          <Titulo>Mi Inventario</Titulo>
          {errorMessage && <TextoStateInicio>{errorMessage}</TextoStateInicio>}
          <p className="frase">Controla tu stock.</p>
          <form onSubmit={handleSubmit(iniciar)}>
            <InputText icono={<v.iconoemail />}>
              <input
                className="form__field"
                type="email" // Asegúrate de usar el tipo adecuado para email
                placeholder="Email"
                {...register("usuario", {
                  required: "Este campo es obligatorio",
                })}
              />
              <label className="form__label">Usuario</label>
              {errors.usuario && <p>{errors.usuario.message}</p>}{" "}
              {/* Muestra el mensaje de error */}
            </InputText>
            <InputText icono={<v.iconopass />}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  className="form__field"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  {...register("pass", {
                    required: "Este campo es obligatorio",
                  })}
                  style={{
                    paddingRight: "40px", // Espacio para el icono
                    transition: "all 0.3s ease-in-out", // Transición suave
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    position: "absolute",
                    right: "10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "5px",
                    borderRadius: "50%",
                    transition: "background 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0f0f0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={22} color="#555" />
                  ) : (
                    <AiOutlineEye size={22} color="#555" />
                  )}
                </button>
              </div>
              <label className="form__label">Contraseña</label>
              {errors.pass && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {errors.pass.message}
                </p>
              )}
            </InputText>

            <ContainerBtn>
              <Btnsave
                titulo={loading ? "Cargando..." : "Ingresar"}
                bgcolor="#fc6b32"
              />
            </ContainerBtn>
          </form>
        </div>
        <FooterLogin />
      </div>
    </Container>
  );
}

const Container = styled.div`
  background-size: cover;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #262626;

  @media ${Device.tablet} {
    grid-template-columns: 1fr 2fr;
  }

  .contentLogo {
    position: absolute;
    top: 15px;
    font-weight: 700;
    display: flex;
    left: 15px;
    align-items: center;
    color: #fff;

    img {
      width: 50px;
    }
  }

  .bannerlateral {
    background-color: #fc6b32;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 80%;
    }
  }

  .contentCard {
    grid-column: 2;
    background-color: #ffffff;
    z-index: 100;
    position: relative;
    gap: 30px;
    display: flex;
    padding: 20px;
    box-shadow: 8px 5px 18px 3px rgba(0, 0, 0, 0.35);
    justify-content: center;
    width: 100%;
    height: 100%;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;

    .card {
      padding-top: 80px;
      width: 100%;

      @media ${Device.laptop} {
        width: 50%;
      }
    }

    .frase {
      color: #fc6c32;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 30px;
    }
  }
`;

const Titulo = styled.span`
  font-size: 3rem;
  font-weight: 700;
`;

const ContainerBtn = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: center;
`;

const TextoStateInicio = styled.p`
  color: #fc7575;
`;

export default LoginTemplate;
