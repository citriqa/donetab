import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment -- will be upgraded to typescript soon
const pluginReactHooks = require("eslint-plugin-react-hooks");
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment -- will be upgraded to typescript soon
const pluginReactCompiler = require("eslint-plugin-react-compiler");

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
		plugins: {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			"react-hooks": pluginReactHooks,
		},
		rules: {
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
		},
		extends: [
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			pluginReactCompiler.configs.recommended,
		],
	},
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
