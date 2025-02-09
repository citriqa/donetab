import React from "react";
import ReactDOM from "react-dom/client";
import Header from "./Header.tsx";
import WindowList from "./WindowList.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<div className="flex flex-col m-auto max-h-[100dvh] pp-4  max-w-[100em]">
			<Header />
			<WindowList />
		</div>
	</React.StrictMode>,
);
