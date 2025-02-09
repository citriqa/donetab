import { Dispatch, SetStateAction, useRef } from "react";
import * as R from "remeda";
import logoUrl from "~/assets/icon.svg";
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
			<div className="flex shrink-0 items-center gap-3.5">
				<img src={logoUrl} className="size-10" />
				<div>
					<h1 className="text-xl">DoneTab</h1>
					<p className="ml-0.5">your saved windows</p>
				</div>
			</div>
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
