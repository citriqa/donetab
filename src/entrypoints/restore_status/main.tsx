import InfoPage from "@/components/InfoPage";
import React from "react";
import ReactDOM from "react-dom/client";
import TabDisplay from "./TabDisplay";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<InfoPage subtitle="your restored tabs">
			<TabDisplay />
		</InfoPage>
	</React.StrictMode>,
);
