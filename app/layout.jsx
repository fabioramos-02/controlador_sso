import "./globals.css";

export const metadata = { title: "Login gov.br pelo SSO do Controlador" };

export default function Layout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <h1>Login gov.br pelo SSO do Controlador</h1>
        {children}
      </body>
    </html>
  );
}
