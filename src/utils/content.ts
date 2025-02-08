export function originalLocation(location: Location): string {
	const { original } = decodeAnchor(location.hash);
	return location.href.replace(location.hash, original);
}

export function decodeAnchor(anchor: string) {
	const [_initial, _marker, title, favicon, ...rest] = anchor.split("#");
	return {
		title: decodeURIComponent(title),
		favicon: decodeURIComponent(favicon),
		original: rest.length ? ["", ...rest].join("#") : "",
	};
}
