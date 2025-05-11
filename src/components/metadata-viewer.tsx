"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

type MetadataResult = {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	siteName?: string;
	type?: string;
	author?: string;
	keywords?: string[];
	other: Record<string, string>;
};

export function MetadataViewer() {
	const [url, setUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [metadata, setMetadata] = useState<MetadataResult | null>(null);
	const [isFormCentered, setIsFormCentered] = useState(true);

	const fetchMetadataMutation = api.metadata.fetchMetadata.useMutation({
		onSuccess: (data) => {
			setMetadata(data);
			setIsFormCentered(false);
			setIsLoading(false);
		},
		onError: (error) => {
			console.error("Error fetching metadata:", error);
			setIsLoading(false);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!url) return;

		setIsLoading(true);
		fetchMetadataMutation.mutate({ url });
	};

	return (
		<div
			className={cn(
				"w-full transition-all duration-700",
				isFormCentered
					? "flex min-h-[60vh] flex-col items-center justify-center"
					: "pt-8",
			)}
		>
			<form
				onSubmit={handleSubmit}
				className={cn(
					"w-full max-w-xl transition-all duration-500 ease-in-out",
					isFormCentered ? "scale-100" : "mx-auto mb-5 scale-95 transform",
				)}
			>
				<div className="flex gap-2">
					<Input
						type="url"
						placeholder="Enter URL to fetch metadata"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						required
						className="flex-1"
					/>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Loading..." : "Fetch"}
					</Button>
				</div>
			</form>

			{metadata && (
				<div
					className={cn(
						"mx-auto grid w-full max-w-4xl gap-6 transition-all duration-500 ease-in-out",
						"fade-in slide-in-from-bottom-4 animate-in duration-700",
					)}
				>
					{/* Main metadata card */}
					<Card>
						<CardHeader>
							<CardTitle>{metadata.title || "No title found"}</CardTitle>
							<CardDescription>
								{metadata.description || "No description found"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4">
								{metadata.image && (
									<div className="overflow-hidden rounded-md">
										<Image
											src={metadata.image}
											alt={metadata.title || "Website preview"}
											className="max-h-64 w-full object-cover"
											width={1000}
											height={1000}
										/>
									</div>
								)}

								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									{metadata.url && (
										<Card>
											<CardHeader>
												<CardTitle className="text-sm">URL</CardTitle>
											</CardHeader>
											<CardContent>
												<a
													href={metadata.url}
													target="_blank"
													rel="noopener noreferrer"
													className="break-all text-blue-500 hover:underline"
												>
													{metadata.url}
												</a>
											</CardContent>
										</Card>
									)}

									{metadata.siteName && (
										<Card>
											<CardHeader>
												<CardTitle className="text-sm">Site Name</CardTitle>
											</CardHeader>
											<CardContent>{metadata.siteName}</CardContent>
										</Card>
									)}

									{metadata.type && (
										<Card>
											<CardHeader>
												<CardTitle className="text-sm">Type</CardTitle>
											</CardHeader>
											<CardContent>{metadata.type}</CardContent>
										</Card>
									)}

									{metadata.author && (
										<Card>
											<CardHeader>
												<CardTitle className="text-sm">Author</CardTitle>
											</CardHeader>
											<CardContent>{metadata.author}</CardContent>
										</Card>
									)}
								</div>

								{metadata.keywords && metadata.keywords.length > 0 && (
									<Card>
										<CardHeader>
											<CardTitle className="text-sm">Keywords</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="flex flex-wrap gap-2">
												{metadata.keywords.map((keyword) => (
													<span
														key={keyword}
														className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground text-xs"
													>
														{keyword}
													</span>
												))}
											</div>
										</CardContent>
									</Card>
								)}

								{Object.keys(metadata.other).length > 0 && (
									<Card>
										<CardHeader>
											<CardTitle className="text-sm">Other Metadata</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												{Object.entries(metadata.other).map(([key, value]) => (
													<div key={key} className="border-b pb-2">
														<p className="font-medium">{key}</p>
														<p className="break-all text-muted-foreground text-sm">
															{value}
														</p>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
