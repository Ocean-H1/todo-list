import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { ThemeProvider } from "@pixie-ui/core";

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
