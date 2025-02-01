import eslint from "vite-plugin-eslint2";
import { defineConfig, WxtViteConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		action: { // action property is needed to enable toolbar click events
			"default_title": "DoneTab - double click to save window",
		},
		permissions: [
			"tabs",
			"bookmarks",
		],
	},
	extensionApi: "chrome",
	srcDir: "src",
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [
			eslint({ "dev": false }),
		] as WxtViteConfig["plugins"],
	}),
	imports: false,
});
