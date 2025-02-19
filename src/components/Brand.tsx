import { EXTENSION_NAME } from "@/utils/constants";
import logoUrl from "~/assets/icon.svg";

export default function Brand({ children }: { children: React.ReactNode | React.ReactNode[] }) {
	return (
		<div className="flex shrink-0 justify-center items-center gap-3.5">
			<img src={logoUrl} className="size-10" />
			<div>
				<h1 className="text-xl leading-[1.25em]">{EXTENSION_NAME}</h1>
				<p className="ml-0.5 leading-[1em]">{children}</p>
			</div>
		</div>
	);
}
