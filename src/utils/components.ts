import { EventHandler, SyntheticEvent } from "react";

export function unpropagated<Ev extends SyntheticEvent>(fn?: EventHandler<Ev>) {
	return (event: Ev) => {
		if (fn) {
			fn(event);
		}
		event.stopPropagation();
	};
}
