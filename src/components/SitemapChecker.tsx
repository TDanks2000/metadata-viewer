"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react"; // Added useEffect for progress
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge"; // Import the Badge component
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

interface SitemapCheckerProps {
	url: string;
}

export function SitemapChecker({ url }: SitemapCheckerProps) {
	const [submitted, setSubmitted] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const checkSitemap = api.sitemap.checkSitemap.useMutation();

	const handleSubmit = () => {
		setSubmitted(true);
		checkSitemap.mutate(
			{ siteUrl: url },
			{
				onSuccess: () => {
					toast("Success", {
						description: "Sitemap check completed successfully",
					});
				},
				onError: (error) => {
					toast("Error", {
						description: error.message,
					});
				},
			},
		);
	};

	const totalPages = checkSitemap.data
		? Math.ceil(checkSitemap.data.length / itemsPerPage)
		: 0;

	return (
		<Card className="mx-auto w-full max-w-4xl shadow">
			<CardHeader>
				<CardTitle className="text-center text-2xl">
					Sitemap Crawlability Checker
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-6 flex justify-center">
					<Button
						onClick={handleSubmit}
						disabled={checkSitemap.isPending}
						className="w-full max-w-xs"
					>
						{checkSitemap.isPending ? "Checking..." : "Check Sitemap"}
					</Button>
				</div>

				{submitted && checkSitemap.isError && (
					<Alert variant="destructive" className="mb-4">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{checkSitemap.error.message}</AlertDescription>
					</Alert>
				)}

				{checkSitemap.data && (
					<div className="space-y-4">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-4/5">URL</TableHead>
										<TableHead className="w-1/5 text-center">Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{checkSitemap.data
										.slice(
											(currentPage - 1) * itemsPerPage,
											currentPage * itemsPerPage,
										)
										.map((item) => (
											<TableRow key={item.url}>
												<TableCell className="max-w-xs truncate">
													<a
														href={item.url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-primary underline transition-all hover:text-primary/80"
													>
														{item.url}
													</a>
												</TableCell>
												<TableCell className="text-center">
													<Badge
														variant={item.crawlable ? "default" : "destructive"}
														className={cn("capitalize")}
													>
														{item.crawlable ? "Crawlable" : "Blocked"}
													</Badge>
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</div>

						{totalPages > 1 && (
							<Pagination className="justify-center">
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() =>
												setCurrentPage((prev) => Math.max(1, prev - 1))
											}
											className={cn(
												currentPage === 1 && "pointer-events-none opacity-50",
											)}
										/>
									</PaginationItem>
									{Array.from({ length: totalPages }, (_, i) => i + 1).map(
										(page) => (
											<PaginationItem key={page}>
												<PaginationLink
													onClick={() => setCurrentPage(page)}
													isActive={currentPage === page}
												>
													{page}
												</PaginationLink>
											</PaginationItem>
										),
									)}
									<PaginationItem>
										<PaginationNext
											onClick={() =>
												setCurrentPage((prev) => Math.min(totalPages, prev + 1))
											}
											className={cn(
												currentPage === totalPages &&
													"pointer-events-none opacity-50",
											)}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
