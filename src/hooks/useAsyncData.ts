import { useEffect, useState } from "react";

export default function<T>(fn: () => Promise<T>): null | T {
	const [value, setValue] = useState<T | null>(null);
	useEffect(() => {
		void fn().then(setValue);
	}, [fn]);
	return value;
}
