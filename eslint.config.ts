import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
	{
		"settings": {
			"react": {
				"version": "detect",
			},
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat["jsx-runtime"],
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
	},
);
