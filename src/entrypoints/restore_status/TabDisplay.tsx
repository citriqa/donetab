import Brand from "@/components/Brand";
import { RESTOREPAGE_LOSTFOCUS } from "@/utils/constants";
import { useCallback, useEffect, useMemo } from "react";

function decodeHash(hash: string) {
	if (hash === "") {
		return [];
	} else {
		return hash.split(";").map(tab => {
			const [url, title, icon] = tab.split(",").map(decodeURIComponent);
			return { url, title, icon };
		});
	}
}

export default function TabDisplay() {
	const failedTabs = useMemo(() => decodeHash(window.location.hash.slice(1)), []);
	const lostFocusListener = useCallback(() => {
		if (document.visibilityState === "hidden") {
			chrome.runtime.sendMessage(RESTOREPAGE_LOSTFOCUS).catch((error: unknown) => {
				console.error("[DoneTab] Failed to send message to background script:", error);
			});
		}
	}, []);
	useEffect(() => {
		if (!failedTabs.length) {
			addEventListener("visibilitychange", lostFocusListener);
		}
		return () => {
			removeEventListener("visibilitychange", lostFocusListener);
		};
	}, [failedTabs]);
	return (
		<div className="flex flex-col p-4 gap-4 max-w-[100em] m-auto">
			<div className="flex justify-start">
				<Brand>
					your restored tabs
				</Brand>
			</div>
			{failedTabs.length
				? (
					<div className="card bg-base-200 p-4 gap-2">
						<p>
							{failedTabs.length === 1 ? "This saved tab" : "These saved tabs"}{" "}
							<strong>cannot be reopened by DoneTab</strong> due to browser limitations:
						</p>
						<ul>
							{failedTabs.map(tab => (
								<li className="odd:bg-base-150 px-2 py-1 gap-2 my-0.5 rounded-sm " key={tab.url}>
									<a
										className="cursor-pointer flex gap-2 items-center justify-between"
										rel="noreferrer"
										target="_blank"
										href={tab.url}
									>
										<div className="flex gap-2 items-center overflow-hidden">
											<img src={tab.icon} className="size-4" />
											<span className="truncate">{tab.title}</span>
										</div>
										<span className="truncate opacity-75 shrink-max">{tab.url}</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				)
				: (
					<div className="card bg-base-200 p-4 m-auto">
						<p>All saved tabs opened.</p>
						<p>This tab will close when you select another.</p>
					</div>
				)}
		</div>
	);
}
