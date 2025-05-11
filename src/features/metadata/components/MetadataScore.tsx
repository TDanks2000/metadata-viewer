import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { MetadataResult } from "@/@types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useMetadataScore } from "../hooks/useMetadataScore";

export function MetadataScore({ metadata }: { metadata: MetadataResult }) {
	const { totalScore, categories } = useMetadataScore(metadata);

	// Get color based on score
	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-500";
		if (score >= 50) return "text-yellow-500";
		return "text-red-500";
	};

	// Get progress color based on score
	const getProgressClass = (score: number) => {
		if (score >= 80) return "bg-green-500/20";
		if (score >= 50) return "bg-yellow-500/20";
		return "bg-red-500/20";
	};

	// Get icon based on score
	const getScoreIcon = (score: number) => {
		if (score >= 80) {
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		}
		if (score >= 50) {
			return <Info className="h-4 w-4 text-yellow-500" />;
		}
		return <AlertTriangle className="h-4 w-4 text-red-500" />;
	};

	return (
		<Card className="overflow-hidden">
			<CardHeader className="px-6 py-4">
				<div className="flex flex-row items-center justify-between">
					<div className="flex items-center gap-2">
						<Info className="h-4 w-4" />
						<CardTitle className="text-sm">SEO Score Analysis</CardTitle>
					</div>
					<div className="flex items-center gap-1.5">
						<span className={`font-bold text-xl ${getScoreColor(totalScore)}`}>
							{totalScore}
						</span>
						<span className="text-muted-foreground text-xs">/100</span>
					</div>
				</div>
				{/* Main progress bar */}
				<Progress
					value={totalScore}
					className={cn("h-2", getProgressClass(totalScore))}
				/>
			</CardHeader>

			<CardContent className="flex flex-col px-6 pt-0 pb-5">
				{/* Categories */}
				<div className="space-y-4">
					{Object.entries(categories).map(([key, category]) => (
						<div key={key} className="flex flex-col gap-1">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="font-medium text-sm capitalize">{key}</span>
									<Badge
										variant="outline"
										className="h-4 px-1.5 py-0 font-normal text-xs"
									>
										{category.importance}
									</Badge>
								</div>
								<div className="flex items-center gap-1.5">
									{getScoreIcon(category.score)}
									<span
										className={`font-medium text-sm ${getScoreColor(category.score)}`}
									>
										{category.score}
									</span>
								</div>
							</div>

							{/* Category progress bar */}
							<Progress
								value={category.score}
								className={cn("h-1", getProgressClass(category.score))}
							/>

							{/* Feedback text */}
							<p className="text-muted-foreground text-xs">
								{category.feedback}
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
