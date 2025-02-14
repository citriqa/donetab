import Favicon from "@/components/Favicon";
import useToggle from "@/hooks/useToggle";
import { deleteTabsFrom, getTabs } from "@/utils/bookmarks";
import MingcuteDelete2Line from "~icons/mingcute/delete-2-line";
import MingcuteLockFill from "~icons/mingcute/lock-fill";
import MingcuteUnlockLine from "~icons/mingcute/unlock-line";

export default function TabItem(
	{ tabData, windowId, pinned, pinToggle }: {
		tabData: Awaited<ReturnType<typeof getTabs>>[0];
		windowId: string;
		pinned: boolean;
		pinToggle: () => void;
	},
) {
	const [deleted, toggleDeleted] = useToggle(false);
	return deleted
		? <></>
		: (
			<li className="flex items-center rounded-sm odd:bg-base-150 has-[.TRASHBUTTON:hover]:bg-error-bg px-2 py-1 gap-2 my-0.5">
				<Favicon src={tabData.icon} className="size-4" />
				<button
					className="group/pinbutton hover:text-primary icon-button cursor-pointer"
					onClick={pinToggle}
					title={pinned ? "Unprotect tab" : "Protect tab"}
				>
					{pinned
						? <MingcuteLockFill />
						: <MingcuteUnlockLine />}
				</button>
				<span className="min-w-10 flex-grow truncate">{tabData.title}</span>
				<button
					className="TRASHBUTTON icon-button cursor-pointer hover:text-error"
					onClick={() => {
						void deleteTabsFrom([tabData.id], windowId);
						toggleDeleted();
					}}
					title="Delete tab"
					aria-label="Delete tab"
				>
					<MingcuteDelete2Line />
				</button>
			</li>
		);
}
