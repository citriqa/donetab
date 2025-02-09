import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
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
		commands: {
			"save-window": {
				"description": "Save and close the current window",
			},
			"list-windows": {
				"description": "Open the list of saved windows",
			},
		},
	},
	extensionApi: "chrome",
	srcDir: "src",
	modules: [
		"@wxt-dev/module-react",
		"@wxt-dev/auto-icons",
	],
	vite: () => ({
		plugins: [
			eslint({ "dev": false }),
			tailwindcss(),
			Icons({ compiler: "jsx", jsx: "react" }),
		] as WxtViteConfig["plugins"],
	}),
	imports: false,
});
