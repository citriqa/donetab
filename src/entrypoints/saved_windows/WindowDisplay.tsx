import { atom } from "jotai";
import { useMemo } from "react";
import Header from "./Header";
import WindowList from "./WindowList";

export default function WindowDisplay() {
	const filter = useMemo(() => atom(""), []);
	return (
		<div className="flex flex-col m-auto limit-content-width pp-4">
			<Header filter={filter} />
			<WindowList filter={filter} />
		</div>
	);
}
