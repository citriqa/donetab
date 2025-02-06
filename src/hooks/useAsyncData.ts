import { returnvoid } from "@/utils/generic";
import { useEffect, useState } from "react";

export default function<T>(fn: () => Promise<T>): null | T {
	const [value, setValue] = useState<T | null>(null);
	useEffect(returnvoid(() => fn().then(setValue)));
	return value;
}
