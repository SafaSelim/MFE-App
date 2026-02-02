import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { federation } from '@module-federation/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const basePath = env.BASE_URL || (isProduction ? '/mfe-vue-remote/' : '/')

  return {
    base: basePath,
    plugins: [
      vue(),
      federation({
        name: 'vueRemote',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/RemoteApp.ts',
        },
        shared: {
          vue: {
            singleton: true,
            requiredVersion: '^3.4.0',
          },
          'vue-router': {
            singleton: true,
            requiredVersion: '^4.2.0',
          },
        },
      }),
    ],
    server: {
      port: 3002,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    preview: {
      port: 3002,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    build: {
      target: 'chrome89',
      minify: isProduction,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/style.css'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    },
  }
})
