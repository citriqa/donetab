import Favicon from "@/components/Favicon";
import useToggle from "@/hooks/useToggle";
import { getTabs } from "@/utils/bookmarks/list";
import { deleteTabsFrom } from "@/utils/bookmarks/other";
import { WriteableAtom } from "@/utils/types";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";
import MingcuteDelete2Line from "~icons/mingcute/delete-2-line";
import MingcuteLockFill from "~icons/mingcute/lock-fill";
import MingcuteUnlockLine from "~icons/mingcute/unlock-line";

export default function TabItem(
	{ tabData, windowId, pinnedTabsAtom }: {
		tabData: Awaited<ReturnType<typeof getTabs>>[0];
		windowId: string;
		pinnedTabsAtom: WriteableAtom<string[]>;
	},
) {
	const setPinnedTabs = useSetAtom(pinnedTabsAtom);
	const [deleted, toggleDeleted] = useToggle(false);
	const isPinned = useAtomValue(
		useMemo(() => atom((get) => get(pinnedTabsAtom).includes(tabData.id)), [pinnedTabsAtom, tabData.id]),
	);
	const pinButtonHandler = useCallback((_event: React.MouseEvent<HTMLButtonElement>) => {
		setPinnedTabs((pinned) =>
			pinned.includes(tabData.id)
				? pinned.filter(id => id !== tabData.id)
				: [...pinned, tabData.id]
		);
	}, [setPinnedTabs, tabData.id]);
	const deleteButtonHandler = useCallback((_event: React.MouseEvent<HTMLButtonElement>) => {
		void deleteTabsFrom([tabData.id], windowId);
		toggleDeleted();
	}, [tabData.id, toggleDeleted, windowId]);
	return deleted
		? <></>
		: (
			<li className="flex items-center rounded-selector odd:bg-base-150 has-[.TRASHBUTTON:hover]:bg-error-bg px-2 py-1 gap-2 my-0.5">
				<Favicon src={tabData.icon} className="size-4" />
				<button
					className="group/pinbutton hover:text-primary icon-button cursor-pointer"
					onClick={pinButtonHandler}
					title={isPinned ? "Unprotect tab" : "Protect tab"}
				>
					{isPinned
						? <MingcuteLockFill />
						: <MingcuteUnlockLine />}
				</button>
				<span className="min-w-10 flex-grow truncate">{tabData.title}</span>
				<button
					className="TRASHBUTTON icon-button cursor-pointer hover:text-error"
					onClick={deleteButtonHandler}
					title="Delete tab"
					aria-label="Delete tab"
				>
					<MingcuteDelete2Line />
				</button>
			</li>
		);
}
