import React from "react";
import Brand from "./Brand";

export default function InfoPage(
	{ subtitle, children }: { subtitle: string; children?: React.ReactNode | React.ReactNode[] },
) {
	return (
		<div className="flex flex-col p-4 gap-4 limit-content-width m-auto">
			<div className="flex justify-start">
				<Brand>
					{subtitle}
				</Brand>
			</div>
			<div className="card bg-base-200 p-4 gap-2 m-auto">
				{children}
			</div>
		</div>
	);
}
