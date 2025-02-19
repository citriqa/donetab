import { EXTENSION_NAME } from "@/utils/constants.ts";
import React from "react";
import ReactDOM from "react-dom/client";
import WindowDisplay from "./WindowDisplay.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<title>{`${EXTENSION_NAME} - Saved Windows`}</title>
		<WindowDisplay />
	</React.StrictMode>,
);
