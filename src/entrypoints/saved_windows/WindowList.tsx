import { extension_folder_id } from "@/utils/bookmarks/common";
import { filterTabs, getWindows, subscribeToFolder } from "@/utils/bookmarks/list";
import { Atom, atom, useAtom, useAtomValue } from "jotai";
import { atomEffect } from "jotai-effect";
import { Accordion } from "radix-ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as R from "remeda";
import WindowItem from "./WindowItem";

function EmptyInfo({ children }: { children: React.ReactNode | React.ReactNode[] }) {
	return <h2 className="p-10 m-auto text-xl">{children}</h2>;
}

export default function WindowList({
	filter,
}: {
	filter: Atom<string>;
}) {
	const [windows, set_windows] = useState<Awaited<ReturnType<typeof getWindows>> | null>(null);
	useEffect(() => {
		void getWindows().then(set_windows);
		const unsubscribe = extension_folder_id.then(id =>
			subscribeToFolder(id, () => {
				void getWindows().then(set_windows);
			})
		);
		return () => {
			void unsubscribe.then(fn => {
				fn();
			});
		};
	}, []);
	const filteredTabsAtom = useMemo(() => atom<Map<string, string[]> | null>(null), []);
	const filteredTabs = useAtomValue(filteredTabsAtom);
	useAtom(useMemo(() =>
		atomEffect((get, set) => {
			const originalFilter = get(filter);
			if (originalFilter) {
				void filterTabs(originalFilter).then((val) => {
					if (originalFilter === get(filter)) {
						set(filteredTabsAtom, val);
					}
				});
			} else {
				set(filteredTabsAtom, null);
			}
		}), [filter, filteredTabsAtom]));
	const [openItems, setOpenItems] = useState<string[]>([]);
	const [filteredOpenItems, setFilteredOpenItems] = useState<string[] | undefined>();
	useEffect(() => {
		setFilteredOpenItems(filteredTabs?.keys().toArray());
	}, [filteredTabs]);
	const toggleHandle = useCallback((id: string) => {
		const currentOpenItems = filteredOpenItems || openItems;
		const index = currentOpenItems.indexOf(id);
		(filteredTabs ? setFilteredOpenItems : setOpenItems)(
			index === -1 ? [...currentOpenItems, id] : R.splice(currentOpenItems, index, 1, []),
		);
	}, [filteredOpenItems, filteredTabs, openItems]);
	return (
		windows === null
			? <></> // fallback while the list of windows is loading
			: windows.length === 0
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
								toggleHandle={toggleHandle}
								data={w}
								key={w.id}
								filteredTabs={filteredTabs?.get(w.id)}
							/>
						))}
				</Accordion.Root>
			)
	);
}
