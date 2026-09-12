import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // O terceiro argumento vazio carrega tambem variaveis sem o prefixo VITE_.
  // Sem loadEnv, process.env so enxergaria variaveis do shell, ignorando o .env.
  // BACKEND_URL fica de fora do bundle justamente por nao ter o prefixo VITE_:
  // quem a le e o servidor de dev, nao o navegador.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Espelha o proxy do nginx em producao: em dev o front tambem chama /api
      // em caminho relativo, entao o mesmo codigo funciona nos dois ambientes.
      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
