import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: [
        'favicon/favicon.ico',
        'favicon/favicon-16x16.png',
        'favicon/favicon-32x32.png',
        'favicon/apple-touch-icon.png',
        'favicon/android-chrome-192x192.png',
        'favicon/android-chrome-512x512.png',
        'assets/img/todo.svg',
        'assets/img/complete.svg',
        'assets/img/delete.svg',
        'assets/img/restore.svg',
        'assets/img/ui.png',
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'Todo Now',
        short_name: 'TodoList',
        description: '一个支持安装与离线访问的待办清单应用',
        theme_color: '#2a7fb9',
        background_color: '#b6fbff',
        display: 'standalone',
        lang: 'zh-CN',
        start_url: process.env.NODE_ENV === 'production' ? '/todo-list/' : '/',
        scope: process.env.NODE_ENV === 'production' ? '/todo-list/' : '/',
        icons: [
          {
            src: 'favicon/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'favicon/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  base: process.env.NODE_ENV === 'production' ? '/todo-list/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
})
