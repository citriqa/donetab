import InfoPage from "@/components/InfoPage";
import React from "react";
import ReactDOM from "react-dom/client";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<InfoPage subtitle="your restored tabs">
			<p className="anim-ellipsis">Your window is being restored.</p>
		</InfoPage>
	</React.StrictMode>,
);
