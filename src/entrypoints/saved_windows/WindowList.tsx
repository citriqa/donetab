import { getWindows } from "@/utils/bookmarks";
import { Accordion } from "radix-ui";
import { useEffect, useState } from "react";
import * as R from "remeda";
import WindowItem from "./WindowItem";

function EmptyInfo({ children }: { children: React.ReactNode | React.ReactNode[] }) {
	return <h2 className="p-10 m-auto text-xl">{children}</h2>;
}

export default function WindowList({
	filteredTabs,
	windows,
}: {
	filteredTabs: Map<string, string[]> | null;
	windows: Awaited<ReturnType<typeof getWindows>>;
}) {
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
					className="min-h-[inherit] flex flex-col pc pt-0 gap-3 max-w-[100em]"
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
