"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { AnalysisForm } from "./AnalysisForm";
import { AnalysisResult } from "./AnalysisResult";

export function AdsenseChecker() {
	const [url, setUrl] = useState("");
	const adsenseCheck = api.adsense.checkAdsense.useQuery(
		{ url },
		{ enabled: false, retry: false },
	);

	const handleCheck = () => {
		if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
			adsenseCheck.refetch();
		} else {
			alert("Please enter a valid URL starting with http:// or https://");
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>AdSense Readiness Analyzer</CardTitle>
				<CardDescription>
					Get a detailed report on your site's readiness for Google AdSense
					based on common approval criteria.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<AnalysisForm
					url={url}
					setUrl={setUrl}
					handleCheck={handleCheck}
					isFetching={adsenseCheck.isFetching}
				/>
				<AnalysisResult queryResult={adsenseCheck} />
			</CardContent>
			<CardFooter>
				<p className="text-muted-foreground text-xs">
					Disclaimer: This is an automated tool and is not a guarantee of
					AdSense approval. The final decision is made by Google.
				</p>
			</CardFooter>
		</Card>
	);
}
