import Brand from "@/components/Brand";
import { WriteableAtom } from "@/utils/types";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import MingcuteCloseLine from "~icons/mingcute/close-line";

export default function Header({ filter }: { filter: WriteableAtom<string> }) {
	const searchInput = useRef<HTMLInputElement>(null);
	const filterUpdate = useSetAtom(filter);
	const clearSearch = useCallback(() => {
		if (searchInput.current) {
			searchInput.current.value = "";
			filterUpdate("");
			searchInput.current.blur();
		}
	}, [filterUpdate]);
	const keyHandler = useCallback((event: KeyboardEvent) => {
		if (event.key === "Escape") clearSearch();
	}, [clearSearch]);
	useEffect(() => {
		addEventListener("keyup", keyHandler);
		return () => {
			removeEventListener("keyup", keyHandler);
		};
	}, [keyHandler]);
	const inputChangeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		filterUpdate(event.target.value);
	}, [filterUpdate]);

	return (
		<div className="flex justify-between gap-4 pc sticky z-10 bg-[var(--root-bg)] top-0">
			<Brand>
				your saved windows
			</Brand>
			<label className="input">
				<input
					ref={searchInput}
					className="grow"
					type="grow"
					spellCheck={false}
					onChange={inputChangeHandler}
					placeholder="Search tabs"
				/>
				<button
					onClick={clearSearch}
				>
					<MingcuteCloseLine />
				</button>
			</label>
		</div>
	);
}
