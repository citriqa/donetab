import useSuspenseMemo from "@/hooks/useSuspenseMemo";
import { extension_folder_id } from "@/utils/bookmarks/common";
import { filterTabs, getWindows, subscribeToFolder } from "@/utils/bookmarks/list";
import { MaybeAwaited } from "@/utils/types";
import { Atom, atom, useAtom, useAtomValue } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { Accordion } from "radix-ui";
import { useState } from "react";
import * as R from "remeda";
import EmptyInfo from "./EmptyInfo";
import WindowItem from "./WindowItem";

const windowsAtom = withAtomEffect(atom<MaybeAwaited<ReturnType<typeof getWindows>>>(getWindows()), (get, set) => {
	const unsubscribe = extension_folder_id.then(id =>
		subscribeToFolder(id, () => {
			// we wait for resolution of the promise before updating the atom in order to not suspend the component while the list of windows is being refreshed
			void getWindows().then(windows => {
				set(windowsAtom, windows);
			});
		})
	);
	return () => {
		void unsubscribe.then(fn => {
			fn();
		});
	};
});

export default function WindowList({
	filter,
}: {
	filter: Atom<string>;
}) {
	const windows = useAtomValue(windowsAtom);
	const filteredTabsAtom = useSuspenseMemo(() =>
		withAtomEffect(atom<Map<string, string[]> | null>(null), (get, set) => {
			if (get(filter) === "") {
				set(filteredTabsAtom, null);
			} else {
				void filterTabs(get(filter)).then(val => {
					set(filteredTabsAtom, val);
				});
			}
		})
	);
	const filteredTabs = useAtomValue(filteredTabsAtom);
	const filteredOpenItemsAtom = useSuspenseMemo(() =>
		withAtomEffect(atom<string[] | undefined>(undefined), (get, set) => {
			set(filteredOpenItemsAtom, get(filteredTabsAtom)?.keys().toArray());
		})
	);
	const [openItems, setOpenItems] = useState<string[]>([]);
	const [filteredOpenItems, setFilteredOpenItems] = useAtom(filteredOpenItemsAtom);
	return (
		windows.length === 0
			? <EmptyInfo>No saved windows...</EmptyInfo>
			: filteredTabs !== null && filteredTabs.size === 0
			? <EmptyInfo>No matching tabs...</EmptyInfo>
			: (
				<Accordion.Root
					value={filteredOpenItems || openItems}
					onValueChange={filteredTabs ? setFilteredOpenItems : setOpenItems}
					className="min-h-[inherit] flex flex-col pc pt-0 gap-3 limit-content-width"
					type="multiple"
				>
					{windows
						.filter(w => filteredTabs === null || filteredTabs.has(w.id))
						.map(w => (
							<WindowItem
								toggleHandle={() => {
									const currentOpenItems = filteredOpenItems || openItems;
									const index = currentOpenItems.indexOf(w.id);
									(filteredTabs ? setFilteredOpenItems : setOpenItems)(
										index === -1 ? [...currentOpenItems, w.id] : R.splice(currentOpenItems, index, 1, []),
									);
								}}
								data={w}
								key={w.id}
								filteredTabs={filteredTabs?.get(w.id)}
							/>
						))}
				</Accordion.Root>
			)
	);
}
