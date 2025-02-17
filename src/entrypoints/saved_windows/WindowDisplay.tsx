import { extension_folder_id } from "@/utils/bookmarks/common";
import { filterTabs } from "@/utils/bookmarks/list";
import { subscribeToFolder } from "@/utils/bookmarks/list";
import { getWindows } from "@/utils/bookmarks/list";
import { useEffect, useState } from "react";
import Header from "./Header";
import WindowList from "./WindowList";

export default function WindowDisplay() {
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
	const [filter, setFilter] = useState("");
	const [filteredTabs, setFilteredTabs] = useState<Map<string, string[]> | null>(null);
	useEffect(() => {
		if (filter === "") {
			setFilteredTabs(null);
		} else {
			void filterTabs(filter).then(setFilteredTabs);
		}
	}, [filter, windows]); // `windows` is not used in the effect directly but the search result should update when the set of saved windows does
	return (
		<div className="flex flex-col m-auto max-h-[100dvh] limit-content-width pp-4">
			<Header filterUpdate={setFilter} />
			<WindowList filteredTabs={filteredTabs} windows={windows} />
		</div>
	);
}
