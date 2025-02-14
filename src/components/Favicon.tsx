import { FALLBACK_FAVICON } from "@/utils/calculated_constants";
import { ReactSVG } from "react-svg";

export default function Favicon({ src, className }: { src?: string; className?: string }) {
	// would love to inline non-fallback SVGs as well, but that not only requires checking the mime type but is also insecure, as they may include JS
	return src
		? <img className={className} src={src} alt="" />
		: (
			<ReactSVG
				src={FALLBACK_FAVICON}
				className={"[&_div]:size-[inherit] [&_svg]:size-[inherit]" + (className ? " " + className : "")}
			/>
		);
}
