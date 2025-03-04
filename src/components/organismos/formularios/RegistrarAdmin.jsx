import styled from "styled-components";
import { v } from "../../../styles/variables";
import { InputText, Btnsave } from "../../../index";
import { useForm } from "react-hook-form";
import { MdAlternateEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const RegisterUser = ({ setState }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const mutation = useMutation(async (data) => {
    // Lógica para registrar usuario (puedes añadir tu lógica de API aquí)
    console.log("Datos enviados:", data);
    navigate("/success"); // Redirige tras éxito
  });

  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
  };

  return (
    <Container>
      <ContentClose>
        <span onClick={setState}>x</span>
      </ContentClose>
      <section className="subcontainer">
        <div className="headers">
          <section>
            <h1>Registrar usuario</h1>
          </section>
        </div>
        <form className="formulario" onSubmit={handleSubmit(onSubmit)}>
          <section>
            <article>
              <InputText icono={<MdAlternateEmail />}>
                <input
                  className="form__field"
                  style={{ textTransform: "lowercase" }}
                  type="email"
                  placeholder="Correo"
                  {...register("correo", {
                    required: "El campo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                      message: "El formato del email es incorrecto",
                    },
                  })}
                />
                <label className="form__label">Email</label>
                {errors.correo && <p>{errors.correo.message}</p>}
              </InputText>
            </article>
            <article>
              <InputText icono={<RiLockPasswordLine />}>
                <input
                  className="form__field"
                  type="password"
                  placeholder="Contraseña"
                  {...register("pass", {
                    required: "El campo es obligatorio",
                  })}
                />
                <label className="form__label">Contraseña</label>
                {errors.pass && <p>{errors.pass.message}</p>}
              </InputText>
            </article>
            <div className="btnguardarContent">
              <Btnsave
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor="#ff7556"
              />
            </div>
          </section>
        </form>
      </section>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  border-radius: 20px;
  background: #fff;
  box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
  padding: 13px 36px 20px 36px;
  z-index: 100;
  display: flex;
  align-items: center;

  .subcontainer {
    width: 100%;
  }

  .headers {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      font-size: 20px;
      font-weight: 500;
    }
    span {
      font-size: 20px;
      cursor: pointer;
    }
  }
  .formulario {
    section {
      gap: 20px;
      display: flex;
      flex-direction: column;

      .btnguardarContent {
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }
    }
  }
`;

const ContentClose = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 33px;
  margin: 30px;
  cursor: pointer;
`;

export default RegisterUser;
