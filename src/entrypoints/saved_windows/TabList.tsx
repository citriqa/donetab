import { getTabs } from "@/utils/bookmarks/list";
import { subscribeToFolder } from "@/utils/bookmarks/list";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import TabItem from "./TabItem";

export default function TabList(
	{ windowId, pinned, filtered }: {
		windowId: string;
		pinned: [string[], Dispatch<SetStateAction<string[]>>];
		filtered?: string[];
	},
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
		<div className="text-sm p-4 pb-0">
			<ul>
				{tabs.filter(tab => filtered === undefined || filtered.includes(tab.id)).map(tab => (
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
			<div className="py-2 ml-1">
				{filtered !== undefined && filtered.length < tabs.length ? <i>and more filtered tabs...</i> : <></>}
			</div>
		</div>
	);
}
