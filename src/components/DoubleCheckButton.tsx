import { DOUBLECHECK_TIMEOUT_MS } from "@/utils/constants";
import { Require } from "@/utils/types";
import { useCallback, useState } from "react";

type ButtonProps = React.ComponentPropsWithRef<"button">;
type ButtonPropsForceOnClick = Require<"onClick", ButtonProps>;

export default function DoubleCheckButton(props: ButtonPropsForceOnClick) {
	const { onClick, ...otherProps } = props;
	const [doubleCheck, setDoubleCheck] = useState(true);

	const clickHandler = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		if (doubleCheck) {
			window.setTimeout(() => {
				setDoubleCheck(true);
			}, DOUBLECHECK_TIMEOUT_MS);
		} else {
			onClick(event);
		}
		setDoubleCheck(prev => !prev);
		event.stopPropagation();
	}, [doubleCheck, onClick]);

	return (
		<button
			{...otherProps}
			onClick={clickHandler}
		>
			{doubleCheck
				? otherProps.children
				: <span className="text-nowrap">Click again</span>}
		</button>
	);
}
