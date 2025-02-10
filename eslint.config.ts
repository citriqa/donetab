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
	{
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					"varsIgnorePattern": "^_",
					"argsIgnorePattern": "^_",
					"caughtErrorsIgnorePattern": "^_",
					"destructuredArrayIgnorePattern": "^_",
				},
			],
			"curly": ["error", "multi-line"], // prevents confusion on which statements are conditional
		},
	},
);
