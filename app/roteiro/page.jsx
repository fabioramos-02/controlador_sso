import { readFile } from "node:fs/promises";
import { marked } from "marked";

// Mostra o ROTEIRO.md da raiz do projeto. Edite o .md; a página acompanha.
export default async function Roteiro() {
  const md = await readFile(process.cwd() + "/ROTEIRO.md", "utf8");
  return (
    <>
      <p><a href="/">← Voltar</a></p>
      <article dangerouslySetInnerHTML={{ __html: marked.parse(md) }} />
    </>
  );
}
