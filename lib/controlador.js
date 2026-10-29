// Os 5 passos do login gov.br pelo SSO do Controlador.
// Este arquivo só roda no servidor: o client_secret nunca chega ao navegador.

const CONTROL_URL = process.env.CONTROL_URL || "https://hom.control.ms.gov.br";
const CLIENT_ID = process.env.CLIENT_ID || "des.testeassinador";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:64178/Default";

export const ambiente = { CONTROL_URL, CLIENT_ID, REDIRECT_URI };

// Passo 1. O navegador abre esta URL e faz o login no gov.br.
// O Controlador devolve o navegador para o REDIRECT_URI com ?code=...
export const urlLogin = () => `${CONTROL_URL}/sso/cidadao?client_id=${encodeURIComponent(CLIENT_ID)}`;

// Passo 2. O backend troca o code pelo token (JWT). O code vale uma vez só.
export const validarCidadao = (code) =>
  chamar("POST", "/api/validar_cidadao/", {
    body: { redirect_uri: REDIRECT_URI, code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET },
  });

// Passo 3. Com o token, o backend busca os dados do cidadão.
export const dadosCidadao = (token) => chamar("GET", "/api/cidadaos/pro/", { token });

// Passo 4. O backend confere se a sessão ainda vale.
export const checarSessao = (token) => chamar("POST", "/api/checar/", { body: { access_token: token } });

// Passo 5. O navegador abre esta URL para sair do SSO.
export const urlSair = () => `${CONTROL_URL}/sso/sair?client_id=${encodeURIComponent(CLIENT_ID)}`;

// ponytail: o nome do campo do token não está documentado; aceita os formatos mais comuns
export const extrairToken = (dados) =>
  typeof dados === "string" ? dados : dados?.access_token || dados?.token || dados?.jwt;

async function chamar(metodo, caminho, { body, token } = {}) {
  const url = CONTROL_URL + caminho;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const r = await fetch(url, { method: metodo, headers, body: body && JSON.stringify(body), cache: "no-store" });
  const texto = await r.text();
  let dados;
  try { dados = JSON.parse(texto); } catch { dados = texto; }

  // O que aparece na tela: sem o secret e sem o token.
  const mostrar = body && { ...body, ...(body.client_secret && { client_secret: "***" }), ...(body.access_token && { access_token: "<token>" }) };
  const requisicao = { [metodo]: url, ...(token && { Authorization: "Bearer <token>" }), ...(mostrar && { body: mostrar }) };
  return { requisicao, status: r.status, ok: r.ok, dados };
}
