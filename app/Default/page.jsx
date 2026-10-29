// Callback: o Controlador volta para cá com ?code=... depois do login.
// O nome /Default vem do REDIRECT_URI cadastrado para o client de teste.
import { ambiente, urlLogin, validarCidadao, dadosCidadao, checarSessao, extrairToken } from "../../lib/controlador";

function Passo({ n, titulo, requisicao, resposta, ok = true }) {
  return (
    <section>
      <h2>
        Passo {n}. {titulo} <span className={ok ? "ok" : "erro"}>{ok ? "✔" : "✘"}</span>
      </h2>
      <b>Requisição</b>
      <pre>{JSON.stringify(requisicao, null, 2)}</pre>
      <b>Resposta</b>
      <pre>{JSON.stringify(resposta, null, 2)}</pre>
      <a href={`/roteiro#passo-${n}`} target="_blank">Dúvida sobre este passo?</a>
    </section>
  );
}

export default async function Callback({ searchParams }) {
  const { code } = await searchParams;
  if (!code) return <p className="erro">Faltou o ?code= na URL. <a href="/">Volte e faça o login.</a></p>;

  const v = await validarCidadao(code);
  const token = extrairToken(v.dados);
  const d = token && (await dadosCidadao(token));
  const c = token && (await checarSessao(token));

  return (
    <>
      <Passo n={1} titulo="Login no gov.br (navegador)" requisicao={{ GET: urlLogin() }}
        resposta={{ redirect: `${ambiente.REDIRECT_URI}?code=${code}` }} />
      <Passo n={2} titulo="Validar cidadão (troca o code pelo token)" requisicao={v.requisicao}
        resposta={{ status: v.status, dados: v.dados }} ok={v.ok} />
      {!token ? (
        <p className="erro">
          Sem token na resposta. Confira o CLIENT_SECRET e se o REDIRECT_URI é igual ao cadastrado.{" "}
          <a href="/">Tentar de novo</a>
        </p>
      ) : (
        <>
          <Passo n={3} titulo="Dados do cidadão" requisicao={d.requisicao} resposta={{ status: d.status, dados: d.dados }} ok={d.ok} />
          <Passo n={4} titulo="Checar sessão" requisicao={c.requisicao} resposta={{ status: c.status, dados: c.dados }} ok={c.ok} />
          <section>
            <h2>Passo 5. Sair</h2>
            <a className="botao" href="/sair">Sair</a>{" "}
            <a href="/roteiro#passo-5" target="_blank">Dúvida sobre este passo?</a>
          </section>
        </>
      )}
    </>
  );
}
