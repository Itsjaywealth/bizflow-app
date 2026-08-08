import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function buildClientEnv(mode) {
  const loadedEnv = loadEnv(mode, process.cwd(), '')
  return Object.fromEntries(
    Object.entries(loadedEnv).filter(([key]) => key.startsWith('REACT_APP_'))
  )
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  define: {
    'process.env': {
      ...buildClientEnv(mode),
      NODE_ENV: mode === 'production' ? 'production' : 'development',
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(js|jsx)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    outDir: 'dist',
  },
}))
