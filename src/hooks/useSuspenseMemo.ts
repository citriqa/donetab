import { useId } from "@lomray/consistent-suspense";

const store = new Map<string, unknown>();

export default function useSuspenseMemo<T>(fn: () => T): T {
	const stableId = useId();
	let value = store.get(stableId) as T | undefined;
	if (!value) {
		value = fn();
		store.set(stableId, value);
	}
	return value;
}
