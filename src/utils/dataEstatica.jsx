import { v } from "../styles/variables";
import { AiOutlineHome, AiOutlineSetting } from "react-icons/ai";

export const DesplegableUser = [
  {
    text: "Cerrar sesión",
    icono: <v.iconoCerrarSesion />,
    tipo: "cerrarsesion",
  },
];

//data SIDEBAR
export const LinksArray = [
  {
    label: "Home",
    icon: <AiOutlineHome />,
    to: "/Home",
  },

  {
    label: "Entradas",
    icon: <v.iconocodigobarras />,
    to: "/Entradas",
  },

  {
    label: "Salidas",
    icon: <v.iconobars />,
    to: "/Salidas",
  },
  {
    label: "Inventarios",
    icon: <v.iconobars />,
    to: "/Inventarios",
  },
];

export const SecondarylinksArray = [];
//temas
export const TemasData = [
  {
    icono: "🌞",
    descripcion: "light",
  },
  {
    icono: "🌚",
    descripcion: "dark",
  },
];
