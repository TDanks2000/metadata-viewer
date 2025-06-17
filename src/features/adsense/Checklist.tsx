"use client";

import type { RouterOutputs } from "@/trpc/react";
import { ChecklistItem } from "./ChecklistItem";

type Results = RouterOutputs["adsense"]["checkAdsense"]["results"];

interface ChecklistProps {
	results: Results;
}

export function Checklist({ results }: ChecklistProps) {
	if (!results) return null;

	return (
		<div className="space-y-4">
			{results.map((item) => (
				<ChecklistItem
					key={item.title}
					title={item.title}
					status={item.status}
					message={item.message}
					isCritical={item.isCritical}
					subChecks={item.subChecks}
				/>
			))}
		</div>
	);
}
