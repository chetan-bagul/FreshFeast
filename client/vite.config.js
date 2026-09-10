import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const isKitchenPortal = mode === "kitchen";
  const isDeliveryPortal = mode === "delivery";
  return {
    plugins: [
      react(),
      {
        name: "kitchen-portal-routes",
        configureServer(server) {
          if (!isKitchenPortal && !isDeliveryPortal) return;
          server.middlewares.use((req, res, next) => {
            if (["/", "/login", "/register"].includes(req.url?.split("?")[0])) req.url = isKitchenPortal ? "/kitchen.html" : "/delivery.html";
            next();
          });
        },
      },
    ],
    server: { port: 5173 },
    build: {
      rollupOptions: {
        input: {
          customer: resolve(__dirname, "index.html"),
          kitchen: resolve(__dirname, "kitchen.html"),
          delivery: resolve(__dirname, "delivery.html"),
        },
      },
    },
  };
});
