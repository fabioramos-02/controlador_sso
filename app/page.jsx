import { ambiente } from "../lib/controlador";

export default function Inicio() {
  return (
    <>
      <p>
        Ambiente: <code>{ambiente.CONTROL_URL}</code> · client: <code>{ambiente.CLIENT_ID}</code>
      </p>
      <ol>
        <li>Login no gov.br (navegador)</li>
        <li>Validar cidadão: troca o code pelo token (servidor)</li>
        <li>Dados do cidadão (servidor)</li>
        <li>Checar sessão (servidor)</li>
        <li>Sair (navegador)</li>
      </ol>
      <a className="botao" href="/login">Entrar com gov.br</a>{" "}
      <a href="/roteiro">Ver o roteiro de cada passo</a>
    </>
  );
}
