export const EXTENSION_NAME = "DoneTab";

export const EXTENSION_IDENTIFIER = EXTENSION_NAME.toLowerCase().replace(/\s+/g, "_");

export const EXTENSION_FOLDER_NAME = `${EXTENSION_NAME} Window Storage`;

export const DOUBLECLICK_INTERVAL_MS = 700;

export const DOUBLECHECK_TIMEOUT_MS = 5000;

export const FAVICON_LOAD_TIMEOUT_MS = 500;

export const RESTORE_ANCHOR = `#__${EXTENSION_IDENTIFIER}-restore__`;

export const PAGE_LOADED = "pageloaded";

export const RESTOREPAGE_LOSTFOCUS = "restorepage-lostfocus";
