import { extension_folder_id } from "@/utils/bookmarks/common";
import { filterTabs, getWindows, subscribeToFolder } from "@/utils/bookmarks/list";
import { Atom, useAtomValue } from "jotai";
import { Accordion } from "radix-ui";
import { useEffect, useState } from "react";
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
	const filterVal = useAtomValue(filter);
	const [windows, set_windows] = useState<Awaited<ReturnType<typeof getWindows>>>([]);
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
	const [filteredTabs, setFilteredTabs] = useState<Map<string, string[]> | null>(null);
	useEffect(() => {
		if (filterVal === "") {
			setFilteredTabs(null);
		} else {
			void filterTabs(filterVal).then(setFilteredTabs);
		}
	}, [filterVal, windows]); // `windows` is not used in the effect directly but the search result should update when the set of saved windows does
	const [openItems, setOpenItems] = useState<string[]>([]);
	const [filteredOpenItems, setFilteredOpenItems] = useState<string[] | undefined>();
	useEffect(() => {
		setFilteredOpenItems(filteredTabs?.keys().toArray());
	}, [filteredTabs]);
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
