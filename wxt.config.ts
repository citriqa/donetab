import eslint from "vite-plugin-eslint2";
import { defineConfig, WxtViteConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	extensionApi: "chrome",
	srcDir: "src",
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [
			eslint({ "dev": false }),
		] as WxtViteConfig["plugins"],
	}),
});
