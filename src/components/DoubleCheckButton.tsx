import { unpropagated } from "@/utils/components";
import { DOUBLECHECK_TIMEOUT_MS } from "@/utils/constants";
import { Require } from "@/utils/types";
import { useState } from "react";

type ButtonProps = React.ComponentPropsWithRef<"button">;
type ButtonPropsForceOnClick = Require<"onClick", ButtonProps>;

export default function DoubleCheckButton(props: ButtonPropsForceOnClick) {
	const { onClick, ...otherProps } = props;
	const [doubleCheck, setDoubleCheck] = useState(true);

	return (
		<button
			{...otherProps}
			onClick={unpropagated(e => {
				if (doubleCheck) {
					window.setTimeout(() => {
						setDoubleCheck(true);
					}, DOUBLECHECK_TIMEOUT_MS);
				} else {
					onClick(e);
				}
				setDoubleCheck(prev => !prev);
			})}
		>
			{doubleCheck
				? otherProps.children
				: <span className="text-nowrap">Click again</span>}
		</button>
	);
}
