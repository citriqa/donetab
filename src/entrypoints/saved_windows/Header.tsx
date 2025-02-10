import Brand from "@/components/Brand";
import { Dispatch, SetStateAction, useRef } from "react";
import * as R from "remeda";
import MingcuteCloseLine from "~icons/mingcute/close-line";

export default function Header({ filterUpdate }: { filterUpdate: Dispatch<SetStateAction<string>> }) {
	const searchInput = useRef<HTMLInputElement>(null);
	const filterThrottle = R.funnel(filterUpdate, {
		minQuietPeriodMs: 200,
		triggerAt: "end",
		reducer: (_accumulator: string | undefined, updated: string) => updated,
	});
	const clearSearch = () => {
		if (searchInput.current) {
			searchInput.current.value = "";
			filterThrottle.call("");
			filterUpdate("");
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
						filterThrottle.call(e.target.value);
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
