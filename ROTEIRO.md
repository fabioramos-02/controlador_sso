# Roteiro: como funciona cada passo

Guia para tirar dúvida durante a reunião com o órgão. Cada passo diz quem chama, o que vai, o que volta e o que costuma dar errado.

Antes de tudo, o órgão precisa de três coisas, uma para cada ambiente:

- **client_id**: o nome da aplicação no Controlador. Pode aparecer no navegador.
- **client_secret**: a senha da aplicação. Fica só no servidor do órgão.
- **redirect_uri**: o endereço de callback que o órgão informou no ofício. O Controlador só devolve o usuário para esse endereço.

| Ambiente | Endereço do Controlador |
|---|---|
| Homologação | `https://hom.control.ms.gov.br` |
| Produção | `https://control.ms.gov.br` |

Resumo do fluxo: o navegador faz o login (passo 1), o servidor do órgão troca o code pelo token (passo 2), usa o token para buscar os dados (passo 3) e conferir a sessão (passo 4). No fim, o navegador sai (passo 5).

<a id="passo-1"></a>

## Passo 1. Login no gov.br

**Quem chama:** o navegador do usuário.

```
GET {CONTROL_URL}/sso/cidadao?client_id={CLIENT_ID}
```

**O que acontece:** o Controlador mostra a tela do gov.br. Depois do login, ele manda o navegador de volta para o `redirect_uri` do órgão com um código na URL:

```
https://sistema-do-orgao/callback?code=abc123
```

**Na PoC:** o botão "Entrar com gov.br" chama `/login`, que redireciona para essa URL (`app/login/route.js`).

**Dúvidas comuns**

- *Por que o navegador e não o servidor?* Porque o usuário precisa digitar a senha dele no gov.br. O sistema do órgão nunca vê essa senha.
- *Voltou para outro endereço ou deu erro no Controlador?* O `redirect_uri` cadastrado está diferente do que o sistema usa. Tem que ser igual, caractere por caractere: protocolo, porta e barra final.

<a id="passo-2"></a>

## Passo 2. Validar cidadão (trocar o code pelo token)

**Quem chama:** o servidor (backend) do órgão.

```
POST {CONTROL_URL}/api/validar_cidadao/
Content-Type: application/json

{
  "redirect_uri": "{REDIRECT_URI}",
  "code": "{code recebido no passo 1}",
  "client_id": "{CLIENT_ID}",
  "client_secret": "{CLIENT_SECRET}"
}
```

**O que volta:** o token (JWT) que libera os passos 3 e 4.

**Na PoC:** função `validarCidadao` em `lib/controlador.js`, chamada pela página `app/Default/page.jsx`.

**Dúvidas comuns**

- *Por que no servidor?* Porque leva o `client_secret`. Se essa chamada for feita no front-end, qualquer pessoa vê o secret no navegador.
- *Deu erro com um code que já funcionou?* O code vale uma vez só e expira rápido. Faça o login de novo.
- *Deu erro de credencial?* Confira se o `client_secret` é do mesmo ambiente do `CONTROL_URL`. Credencial de homologação não funciona em produção.
- *O `redirect_uri` vai de novo aqui?* Vai, e precisa ser o mesmo do passo 1.

<a id="passo-3"></a>

## Passo 3. Dados do cidadão

**Quem chama:** o servidor do órgão.

```
GET {CONTROL_URL}/api/cidadaos/pro/
Authorization: Bearer {token}
```

**O que volta:** os dados do cidadão que fez o login. É com eles que o sistema do órgão identifica o usuário, por exemplo pelo CPF.

**Na PoC:** função `dadosCidadao` em `lib/controlador.js`.

**Dúvidas comuns**

- *Deu 401?* O token não foi enviado, foi enviado sem o `Bearer ` na frente, ou venceu.
- *Preciso guardar o token?* Guarde na sessão do servidor, nunca em `localStorage` no navegador.

<a id="passo-4"></a>

## Passo 4. Checar sessão

**Quem chama:** o servidor do órgão.

```
POST {CONTROL_URL}/api/checar/
Content-Type: application/json

{ "access_token": "{token}" }
```

**O que volta:** se o token ainda vale.

**Na PoC:** função `checarSessao` em `lib/controlador.js`.

**Dúvidas comuns**

- *Quando chamar?* Ao retomar uma sessão ou antes de uma ação importante. Se o token não vale mais, mande o usuário de volta para o passo 1.

<a id="passo-5"></a>

## Passo 5. Sair

**Quem chama:** o navegador do usuário.

```
GET {CONTROL_URL}/sso/sair?client_id={CLIENT_ID}
```

**O que acontece:** encerra a sessão no Controlador.

**Na PoC:** o botão "Sair" chama `/sair`, que redireciona para essa URL (`app/sair/route.js`).

**Dúvidas comuns**

- *Só apagar a sessão do meu sistema basta?* Não. Sem chamar o `/sso/sair`, o próximo login entra direto, sem pedir senha, porque a sessão do Controlador continua aberta.

## Checklist para produção

- Login, dados e sair funcionando em homologação.
- Callback de produção com HTTPS, informado no ofício.
- `client_id` e `client_secret` de produção guardados como segredo no servidor.
- Sessão vencida tratada: o sistema chama o passo 4 e volta para o login.
- Botão "Sair" chamando o passo 5.
