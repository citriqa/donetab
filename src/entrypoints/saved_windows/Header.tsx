import Brand from "@/components/Brand";
import { WriteableAtom } from "@/utils/types";
import { useSetAtom } from "jotai";
import { useCallback, useRef } from "react";
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
	const clearSearch = () => {
		if (searchInput.current) {
			searchInput.current.value = "";
			filterThrottle("");
			searchInput.current.blur();
		}
	};
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
					onKeyUp={e => {
						if (e.key === "Escape") {
							clearSearch();
						}
					}}
					onChange={e => {
						filterThrottle(e.target.value);
					}}
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
