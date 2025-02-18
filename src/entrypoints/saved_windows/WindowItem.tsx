import DoubleCheckButton from "@/components/DoubleCheckButton";
import useAtomReader from "@/hooks/useAtomReader";
import useToggle from "@/hooks/useToggle";
import { getWindows } from "@/utils/bookmarks/list";
import { deleteWindowExcept, renameWindow } from "@/utils/bookmarks/other";
import { restoreWindow } from "@/utils/bookmarks/restore";
import { unpropagated } from "@/utils/components";
import { returnvoid } from "@/utils/generic";
import { Suspense } from "@lomray/consistent-suspense";
import { atom, useSetAtom } from "jotai";
import { Accordion } from "radix-ui";
import { useMemo, useRef } from "react";
import MingcuteBroomLine from "~icons/mingcute/broom-line";
import MingcuteCheckLine from "~icons/mingcute/check-line";
import MingcuteDownLine from "~icons/mingcute/down-line";
import MingcutePencilLine from "~icons/mingcute/pencil-line";
import MingcuteRestoreLine from "~icons/mingcute/restore-line";
import TabList from "./TabList";

export default function WindowItem(
	{ data, toggleHandle, filteredTabs }: {
		data: Awaited<ReturnType<typeof getWindows>>[0];
		toggleHandle: () => void;
		filteredTabs?: string[];
	},
) {
	function disableEditing() {
		if (!titleInput.current) throw new Error("Title input ref not set");
		void renameWindow(data.id, titleInput.current.value);
		toggleTitleEditable();
	}
	const pinnedTabsAtom = useMemo(() => atom<string[]>([]), []);
	const readPinnedTabs = useAtomReader(pinnedTabsAtom);
	const setPinnedTabs = useSetAtom(pinnedTabsAtom);
	const [isTitleEditable, toggleTitleEditable] = useToggle(false);
	const titleInput = useRef<HTMLInputElement>(null);

	return (
		<Accordion.Item
			key={data.id}
			value={data.id}
			className="card bg-base-200 group"
		>
			<Accordion.Header
				asChild // default element is h3, which cannot nest the heading contained
			>
				<div
					onClick={toggleHandle} // not wrapping the entire header in Accordion.Trigger because nested buttons are bad accessibilty
					className="flex flex-row items-center gap-4 p-2 card bg-base-100 cursor-pointer"
				>
					<Accordion.Trigger
						aria-label="Show/hide tabs of window"
						className="ml-[8px] shrink-0"
					>
						<MingcuteDownLine className="size-6 w-[1.5rem] group-data-[state=open]:rotate-180 transition-transform" />
					</Accordion.Trigger>
					{isTitleEditable
						? (
							<input
								autoFocus
								ref={titleInput}
								key={data.title}
								onClick={unpropagated()}
								onKeyUp={e => {
									if (e.key === "Enter") disableEditing();
								}}
								defaultValue={data.title}
								aria-label="Edit window name"
								className="flex-grow input"
							/>
						)
						: (
							<h3 className="truncate min-w-10 basis-[fit-content] shrink-1 grow-1 text-lg">
								{data.title}
							</h3>
						)}
					<div className="join basis-[fit-content] shrink-max">
						<button
							onClick={unpropagated(() => {
								if (isTitleEditable) {
									disableEditing();
								} else {
									toggleTitleEditable();
								}
							})}
							title={isTitleEditable ? "Save the window name" : "Edit the window name"}
							className="join-item btn btn-secondary not-dark:btn-soft icon-button flex-wrap overflow-hidden shrink"
						>
							{isTitleEditable
								? (
									<>
										<MingcuteCheckLine className="h-full" />
										<span>Save Name</span>
									</>
								)
								: (
									<>
										<MingcutePencilLine className="h-full" />
										<span>Rename</span>
									</>
								)}
						</button>
						<DoubleCheckButton
							onClick={returnvoid(async () => {
								await deleteWindowExcept(
									data.id,
									readPinnedTabs(),
								);
								setPinnedTabs([]);
							})}
							title="Remove all unprotected tabs from window"
							className="join-item btn not-dark:btn-soft [--depth:1.5] btn-error icon-button flex-wrap overflow-hidden shrink"
						>
							<>
								<MingcuteBroomLine className="h-full" />
								<span>Delete</span>
							</>
						</DoubleCheckButton>
						<button
							onClick={unpropagated(returnvoid(() => restoreWindow(data.id)))}
							title="Restore the window to the browser"
							className="join-item btn not-dark:btn-soft btn-primary icon-button flex-wrap overflow-hidden shrink"
						>
							<MingcuteRestoreLine className="h-full" />
							<span>Restore</span>
						</button>
					</div>
				</div>
			</Accordion.Header>
			<Accordion.Content className="pp-4 overflow-hidden">
				<Suspense fallback={<p className="pc">Loading Tabs...</p>}>
					<TabList
						windowId={data.id}
						pinnedTabsAtom={pinnedTabsAtom}
						filtered={filteredTabs}
					/>
				</Suspense>
			</Accordion.Content>
		</Accordion.Item>
	);
}
