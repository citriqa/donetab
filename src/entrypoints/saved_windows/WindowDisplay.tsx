import { atom, SetStateAction } from "jotai";
import { useMemo } from "react";
import Header from "./Header";
import WindowList from "./WindowList";

export default function WindowDisplay() {
	const filter = useMemo(() => {
		let filterTimeout: NodeJS.Timeout | null = null;
		const baseAtom = atom("");
		const throttledAtom = atom(get => get(baseAtom), (get, set, update: SetStateAction<string>) => {
			const newVal = typeof update === "function" ? update(get(baseAtom)) : update;
			if (filterTimeout) {
				clearTimeout(filterTimeout);
			}
			if (newVal) {
				// eslint-disable-next-line react-compiler/react-compiler -- filterTimeout variable is not used in render
				filterTimeout = setTimeout(() => {
					set(baseAtom, newVal);
				}, Math.max(1000 - (update.length - 1) * 150, 300));
			} else {
				set(baseAtom, newVal);
				filterTimeout = null;
			}
		});
		return throttledAtom;
	}, []);
	return (
		<div className="flex flex-col m-auto limit-content-width pp-4">
			<Header filter={filter} />
			<WindowList filter={filter} />
		</div>
	);
}
