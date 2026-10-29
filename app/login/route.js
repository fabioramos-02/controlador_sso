import { urlLogin } from "../../lib/controlador";

// Passo 1: manda o navegador para o login do Controlador.
export const GET = () => Response.redirect(urlLogin());
