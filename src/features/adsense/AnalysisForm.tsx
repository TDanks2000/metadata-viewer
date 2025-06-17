"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnalysisFormProps {
	url: string;
	setUrl: (url: string) => void;
	handleCheck: () => void;
	isFetching: boolean;
}

export function AnalysisForm({
	url,
	setUrl,
	handleCheck,
	isFetching,
}: AnalysisFormProps) {
	return (
		<div className="flex items-end space-x-2">
			<div className="flex-grow space-y-2">
				<Label htmlFor="adsense-url">Website URL</Label>
				<Input
					id="adsense-url"
					placeholder="https://example.com"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleCheck()}
					type="url"
				/>
			</div>
			<Button
				onClick={handleCheck}
				disabled={!url || isFetching}
				className="h-10"
			>
				{isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				Analyze Site
			</Button>
		</div>
	);
}
