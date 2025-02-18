import { Suspense } from "@lomray/consistent-suspense";
import { atom } from "jotai";
import { useMemo } from "react";
import EmptyInfo from "./EmptyInfo";
import Header from "./Header";
import WindowList from "./WindowList";

export default function WindowDisplay() {
	const filter = useMemo(() => atom(""), []);
	return (
		<div className="flex flex-col m-auto max-h-[100dvh] limit-content-width pp-4">
			<Header filter={filter} />
			<Suspense fallback={<EmptyInfo>Loading...</EmptyInfo>}>
				<WindowList filter={filter} />
			</Suspense>
		</div>
	);
}
