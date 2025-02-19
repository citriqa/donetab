import Brand from "@/components/Brand";
import { WriteableAtom } from "@/utils/types";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import MingcuteCloseLine from "~icons/mingcute/close-line";

export default function Header({ filter }: { filter: WriteableAtom<string> }) {
	const filterTimeout = useRef<NodeJS.Timeout | null>(null);
	const searchInput = useRef<HTMLInputElement>(null);
	const filterUpdate = useSetAtom(filter);
	const filterThrottle = useCallback((value: string) => {
		if (filterTimeout.current) {
			clearTimeout(filterTimeout.current);
		}
		if (value) {
			filterTimeout.current = setTimeout(() => {
				filterUpdate(value);
			}, Math.max(1000 - (value.length - 1) * 150, 300));
		} else {
			filterUpdate(value);
			filterTimeout.current = null;
		}
	}, [filterUpdate]);
	const clearSearch = useCallback(() => {
		if (searchInput.current) {
			searchInput.current.value = "";
			filterThrottle("");
			searchInput.current.blur();
		}
	}, [filterThrottle]);
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
		filterThrottle(event.target.value);
	}, [filterThrottle]);

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
