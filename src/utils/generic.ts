// can wrap an async function to explicitly declare that its return value is of no interest, for example when used as an event handler
// used to resolve @typescript-eslint/no-misused-promises
export function returnvoid<P extends unknown[], R>(fn: (...args: P) => Promise<R>) {
	return (...args: P) => {
		void fn(...args);
	};
}
