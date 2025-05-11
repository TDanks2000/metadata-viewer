"use client";

import { cn } from "@/lib/utils";
import { useMetadataFetcher } from "../hooks/useMetadataFetcher";
import { MetadataDisplay } from "./MetadataDisplay";
import { MetadataForm } from "./MetadataForm";

export function MetadataViewer() {
	const { url, setUrl, isLoading, metadata, isFormCentered, handleSubmit } =
		useMetadataFetcher();

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

			{metadata && <MetadataDisplay metadata={metadata} />}
		</div>
	);
}
