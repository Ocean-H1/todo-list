import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { ThemeProvider } from "@pixie-ui/core";
import { registerSW } from 'virtual:pwa-register'

// 全局样式
import "./global.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);

// 注册 Service Worker：使用提示而非立即更新，避免用户未保存数据丢失
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      const shouldUpdate = window.confirm(
        '检测到新版本，是否立即更新？\n更新将刷新页面，可能导致未保存内容丢失。'
      );
      if (shouldUpdate) {
        // 触发更新并刷新
        updateSW(true);
      }
    },
    onOfflineReady() {
      // 可按需提示“离线就绪”
      // console.log('应用已可离线使用');
    },
  });
}
