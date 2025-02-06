import { useState } from "react";

export default function(initial: boolean) {
	const [value, setValue] = useState(initial);
	return [value, () => {
		setValue(val => !val);
	}] as const;
}
