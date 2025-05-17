"use client";

import { SitemapChecker } from "@/components/SitemapChecker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMetadataFetcher } from "../hooks/useMetadataFetcher";
import { MetadataDisplay } from "./MetadataDisplay";
import { MetadataForm } from "./MetadataForm";
import { MetadataScore } from "./MetadataScore";

interface MetadataViewerProps {
	initialUrl?: string;
}

export function MetadataViewer({ initialUrl }: MetadataViewerProps) {
	const {
		url,
		setUrl,
		isLoading,
		metadata,
		isFormCentered,
		handleSubmit,
		error,
	} = useMetadataFetcher();

	return (
		<div
			className={cn(
				"w-full transition-all duration-700",
				isFormCentered
					? "flex min-h-[60vh] flex-col items-center justify-center"
					: "pt-8",
			)}
		>
			<MetadataForm
				url={url}
				setUrl={setUrl}
				isLoading={isLoading}
				handleSubmit={handleSubmit}
				isFormCentered={isFormCentered}
			/>

			{!!metadata && !error && (
				<div className="mx-auto mt-8 w-full max-w-4xl">
					{/* Center the tabs */}
					<Tabs defaultValue="metadata">
						<TabsList className="grid w-full grid-cols-3">
							{/* Adjust grid-cols based on number of tabs */}
							<TabsTrigger value="metadata">Metadata Details</TabsTrigger>
							<TabsTrigger value="score">Metadata Score</TabsTrigger>
							{!!initialUrl?.length && (
								<TabsTrigger value="sitemap">Sitemap Checker</TabsTrigger>
							)}
						</TabsList>
						<TabsContent value="metadata">
							<MetadataDisplay metadata={metadata} />
						</TabsContent>
						<TabsContent value="score">
							<MetadataScore metadata={metadata} />
						</TabsContent>
						{!!initialUrl?.length && (
							<TabsContent value="sitemap">
								<SitemapChecker url={initialUrl} />
							</TabsContent>
						)}
					</Tabs>
				</div>
			)}
		</div>
	);
}
