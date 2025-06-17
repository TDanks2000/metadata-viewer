"use client";

import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	XCircle,
} from "lucide-react";

type Status = "pass" | "fail" | "warn";

interface ChecklistItemProps {
	status: Status;
	title: string;
	message: string;
	isCritical: boolean;
	subChecks?: {
		text: string;
		status: boolean;
	}[];
}

const statusConfig = {
	pass: {
		Icon: CheckCircle2,
		color: "text-green-600 dark:text-green-500",
	},
	fail: {
		Icon: XCircle,
		color: "text-destructive",
	},
	warn: {
		Icon: AlertCircle,
		color: "text-amber-500 dark:text-amber-400",
	},
};

export function ChecklistItem({
	status,
	title,
	message,
	isCritical,
	subChecks,
}: ChecklistItemProps) {
	const { Icon, color } = statusConfig[status];

	return (
		<div className="flex items-start space-x-3">
			<Icon className={`mt-1 h-5 w-5 flex-shrink-0 ${color}`} />
			<div>
				<div className="flex items-center space-x-2">
					<p className="font-medium">{title}</p>
					{isCritical && status === "fail" && (
						<div
							className="flex items-center rounded-full bg-destructive/10 px-2 py-0.5 font-semibold text-destructive text-xs"
							title="This is a critical issue"
						>
							<AlertTriangle className="mr-1 h-3 w-3" />
							Critical
						</div>
					)}
				</div>
				<p className="text-muted-foreground text-sm">{message}</p>
				{subChecks && (
					<div className="mt-2 space-y-1.5 pl-2">
						{subChecks.map((sub) => (
							<div key={sub.text} className="flex items-center text-sm">
								{sub.status ? (
									<CheckCircle2 className="mr-2 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500" />
								) : (
									<XCircle className="mr-2 h-4 w-4 flex-shrink-0 text-destructive" />
								)}
								<span
									className={
										!sub.status ? "text-destructive" : "text-muted-foreground"
									}
								>
									{sub.text}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
