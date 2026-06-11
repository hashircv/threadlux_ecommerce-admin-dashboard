import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:5000",
      "/admin": "http://localhost:5000",
      "/products": "http://localhost:5000",
      "/cart": "http://localhost:5000",
      "/orders": "http://localhost:5000",
      "/health": "http://localhost:5000",
    },
  },
});
