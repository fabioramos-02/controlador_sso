import { urlSair } from "../../lib/controlador";

// Passo 5: manda o navegador para o logout do Controlador.
export const GET = () => Response.redirect(urlSair());
