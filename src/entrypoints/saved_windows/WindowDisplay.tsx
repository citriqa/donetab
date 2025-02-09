import { filterTabs } from "@/utils/bookmarks";
import { useEffect, useState } from "react";
import Header from "./Header";
import WindowList from "./WindowList";

export default function WindowDisplay() {
	const [filter, setFilter] = useState("");
	const [filteredTabs, setFilteredTabs] = useState<Map<string, string[]> | null>(null);
	useEffect(() => {
		if (filter === "") {
			setFilteredTabs(null);
		} else {
			void filterTabs(filter).then(setFilteredTabs);
		}
	}, [filter]);
	return (
		<div className="flex flex-col m-auto max-h-[100dvh] max-w-[100em] pp-4">
			<Header filterUpdate={setFilter} />
			<WindowList filteredTabs={filteredTabs} />
		</div>
	);
}
