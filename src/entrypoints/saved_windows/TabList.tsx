import useSuspenseMemo from "@/hooks/useSuspenseMemo";
import { getTabs } from "@/utils/bookmarks/list";
import { subscribeToFolder } from "@/utils/bookmarks/list";
import { MaybeAwaited, WriteableAtom } from "@/utils/types";
import { atom, useAtomValue } from "jotai";
import { withAtomEffect } from "jotai-effect";
import TabItem from "./TabItem";

export default function TabList(
	{ windowId, pinnedTabsAtom, filtered }: {
		windowId: string;
		pinnedTabsAtom: WriteableAtom<string[]>;
		filtered?: string[];
	},
) {
	const tabsAtom = useSuspenseMemo(() =>
		// windowId cannot change, so it's safe to not have it as a dependency
		withAtomEffect(atom<MaybeAwaited<ReturnType<typeof getTabs>>>(getTabs(windowId)), (get, set) => {
			return subscribeToFolder(windowId, () => {
				// we wait for resolution of the promise before updating the atom in order to not suspend the component while the list of tabs is being refreshed
				void getTabs(windowId).then(tabs => {
					set(tabsAtom, tabs);
				});
			});
		})
	);
	const tabs = useAtomValue(tabsAtom);
	return (
		<div className="text-sm pc pb-0">
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
			<div className="py-[calc(var(--parent-padding)/2)] ml-1">
				{filtered !== undefined && filtered.length < tabs.length ? <i>and more filtered tabs...</i> : <></>}
			</div>
		</div>
	);
}
