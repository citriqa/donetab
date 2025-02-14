import useAsyncData from "@/hooks/useAsyncData";
import { extensionFolderId, filterTabs, getWindows, subscribeToFolder } from "@/utils/bookmarks";
import { useEffect, useState } from "react";
import Header from "./Header";
import WindowList from "./WindowList";

export default function WindowDisplay() {
	const extension_folder_id = useAsyncData(extensionFolderId);
	const [windows, set_windows] = useState<Awaited<ReturnType<typeof getWindows>>>([]);
	useEffect(() => {
		if (extension_folder_id !== null) {
			void getWindows().then(set_windows);
			return subscribeToFolder(extension_folder_id, () => {
				void getWindows().then(set_windows);
			});
		}
	}, [extension_folder_id]);
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
