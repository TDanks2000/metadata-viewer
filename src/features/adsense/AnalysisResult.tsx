"use client";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { AlertCircle, CheckCircle2, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { RouterOutputs } from "@/trpc/react";
import { Checklist } from "./Checklist";

type AdsenseQueryResult = UseTRPCQueryResult<
	RouterOutputs["adsense"]["checkAdsense"],
	any
>;

interface AnalysisResultProps {
	queryResult: AdsenseQueryResult;
}

function RecommendationAlert({
	summary,
}: {
	summary: NonNullable<AdsenseQueryResult["data"]>["summary"];
}) {
	if (!summary) return null;

	const percentage = summary.score / summary.total;
	const isGood = percentage >= 0.9;
	const isWarning = percentage >= 0.5 && percentage < 0.9;

	const variant = isGood || isWarning ? "default" : "destructive";
	const Icon = isGood ? CheckCircle2 : AlertCircle;
	const title = isGood
		? "Excellent!"
		: isWarning
			? "Needs Improvement"
			: "Significant Issues Found";

	return (
		<Alert variant={variant}>
			<Icon className="h-4 w-4" />
			<AlertTitle>
				{title} ({summary.score}/{summary.total} checks passed)
			</AlertTitle>
			<AlertDescription>{summary.recommendation}</AlertDescription>
		</Alert>
	);
}

export function AnalysisResult({ queryResult }: AnalysisResultProps) {
	const { data, isFetching, isError, error } = queryResult;

	if (isFetching) {
		return (
			<div className="space-y-4 pt-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-4 w-full" />
				<div className="space-y-3 pt-2">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant="destructive">
				<Terminal className="h-4 w-4" />
				<AlertTitle>Analysis Failed</AlertTitle>
				<AlertDescription>
					{error.message || "An unexpected error occurred. Please try again."}
				</AlertDescription>
			</Alert>
		);
	}

	if (data) {
		if (!data.results || data.results.length === 0) {
			return (
				<Alert variant="destructive">
					<Terminal className="h-4 w-4" />
					<AlertTitle>Analysis Incomplete</AlertTitle>
					<AlertDescription>
						{data.error ||
							"Could not generate a full report for the given URL."}
					</AlertDescription>
				</Alert>
			);
		}

		return (
			<div className="space-y-6 pt-4">
				{data.summary && <RecommendationAlert summary={data.summary} />}
				{data.summary && (
					<div>
						<Progress
							value={(data.summary.score / data.summary.total) * 100}
							className="w-full"
						/>
					</div>
				)}
				<Checklist results={data.results} />
			</div>
		);
	}

	return null;
}
