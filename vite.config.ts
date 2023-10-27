import { defineConfig } from "vite";
import { PORT_CLIENT } from "./config";
import react from "@vitejs/plugin-react";
import { BACKEND_URL } from "./config";
import { ViteMinifyPlugin } from "vite-plugin-minify";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		ViteMinifyPlugin({}),
	],
	server: {
		port: PORT_CLIENT,
		proxy: {
			"/api/": {
				target: BACKEND_URL,
				changeOrigin: true,
				secure: false,
				ws: true,
			},
		},
	},
	preview: {
		port: PORT_CLIENT,
	},
});
