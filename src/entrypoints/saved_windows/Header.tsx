import logoUrl from "~/assets/icon.svg";

export default function Header() {
	return (
		<div className="flex justify-between gap-4 pc sticky z-10 bg-[var(--root-bg)] top-0">
			<div className="flex shrink-0 items-center gap-3.5">
				<img src={logoUrl} className="size-10" />
				<div>
					<h1 className="text-xl">DoneTab</h1>
					<p className="ml-0.5">your saved windows</p>
				</div>
			</div>
		</div>
	);
}
