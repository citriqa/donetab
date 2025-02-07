import { getTabs, subscribeToFolder } from "@/utils/bookmarks";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import TabItem from "./TabItem";

export default function TabList(
	{ windowId, pinned }: { windowId: string; pinned: [string[], Dispatch<SetStateAction<string[]>>] },
) {
	const [pinnedTabs, setPinnedTabs] = pinned;

	const [tabs, set_tabs] = useState<Awaited<ReturnType<typeof getTabs>>>([]);
	useEffect(() => {
		void getTabs(windowId).then(set_tabs);
		return subscribeToFolder(windowId, () => {
			void getTabs(windowId).then(set_tabs);
		});
	});

	return (
		<ul className="text-sm p-4">
			{tabs.map(tab => (
				<TabItem
					key={tab.id}
					windowId={windowId}
					pinned={pinnedTabs.includes(tab.id)}
					pinToggle={() => {
						setPinnedTabs(pinned =>
							pinned.includes(tab.id)
								? pinned.filter(id => id !== tab.id)
								: [...pinned, tab.id]
						);
					}}
					tabData={tab}
				/>
			))}
		</ul>
	);
}
