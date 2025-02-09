import useAsyncData from "@/hooks/useAsyncData";
import { extensionFolderId, getWindows, subscribeToFolder } from "@/utils/bookmarks";
import { Accordion } from "radix-ui";
import { useEffect, useState } from "react";
import * as R from "remeda";
import WindowItem from "./WindowItem";

export default function WindowList() {
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
	const [openItems, setOpenItems] = useState<string[]>([]);
	return (
		<Accordion.Root
			value={openItems}
			onValueChange={setOpenItems}
			className="min-h-[inherit] flex flex-col pc pt-0 gap-3"
			type="multiple"
		>
			{windows.length
				? windows.map(w => (
					<WindowItem
						toggleHandle={() => {
							const index = openItems.indexOf(w.id);
							if (index === -1) {
								setOpenItems([...openItems, w.id]);
							} else {
								setOpenItems(R.splice(openItems, index, 1, []));
							}
						}}
						data={w}
						key={w.id}
					/>
				))
				: <h2 className="p-10 m-auto text-xl">No saved windows...</h2>}
		</Accordion.Root>
	);
}
