import { Atom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

// returns a function that can read the current value of an atom without triggering a re-render
export default function<T>(atom: Atom<T>): () => T {
	return useAtomCallback(
		useCallback((get) => {
			return get(atom);
		}, [atom]),
	);
}
