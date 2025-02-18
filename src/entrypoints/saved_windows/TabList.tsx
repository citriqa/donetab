import { getTabs } from "@/utils/bookmarks/list";
import { subscribeToFolder } from "@/utils/bookmarks/list";
import { WriteableAtom } from "@/utils/types";
import { useEffect, useState } from "react";
import TabItem from "./TabItem";

export default function TabList(
	{ windowId, pinnedTabsAtom, filtered }: {
		windowId: string;
		pinnedTabsAtom: WriteableAtom<string[]>;
		filtered?: string[];
	},
) {
	const [tabs, set_tabs] = useState<Awaited<ReturnType<typeof getTabs>>>([]);
	useEffect(() => {
		void getTabs(windowId).then(set_tabs);
		return subscribeToFolder(windowId, () => {
			void getTabs(windowId).then(set_tabs);
		});
	}, [windowId]);

	return (
		<div className="text-sm p-4 pb-0">
			<ul>
				{tabs.filter(tab => filtered === undefined || filtered.includes(tab.id)).map(tab => (
					<TabItem
						key={tab.id}
						windowId={windowId}
						pinnedTabsAtom={pinnedTabsAtom}
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
