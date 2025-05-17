"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MetadataResult } from "@/@types";
import { api } from "@/trpc/react";

export function useMetadataFetcher() {
	const searchParams = useSearchParams();
	const urlParam = searchParams.get("url");
	const [url, setUrl] = useState(urlParam ? decodeURIComponent(urlParam) : "");
	const [isLoading, setIsLoading] = useState(false);
	const [metadata, setMetadata] = useState<MetadataResult | null>(null);
	const [isFormCentered, setIsFormCentered] = useState(!urlParam);

	const fetchMetadataMutation = api.metadata.fetchMetadata.useMutation({
		onSuccess: (data) => {
			setMetadata(data);
			setIsFormCentered(false);
			setIsLoading(false);

			toast.success("Metadata fetched successfully", {
				description: "The metadata has been fetched successfully.",
			});
		},
		onError: (error) => {
			console.error("Error fetching metadata:", error);
			setIsLoading(false);
			setMetadata(null);

			toast.error("Error fetching metadata", {
				description: error.message,
			});
		},
	});

	useEffect(() => {
		if (urlParam) {
			const decodedUrl = decodeURIComponent(urlParam);
			setUrl(decodedUrl);
			setIsLoading(true);
			fetchMetadataMutation.mutate({ url: decodedUrl });
		}
	}, [urlParam, fetchMetadataMutation.mutate]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!url) return;
		setIsLoading(true);
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set("url", url);
		window.history.pushState({}, "", newUrl);
		fetchMetadataMutation.mutate({ url });
	};

	return {
		url,
		setUrl,
		isLoading,
		metadata,
		isFormCentered,
		setIsFormCentered,
		handleSubmit,
		error: fetchMetadataMutation.error,
	};
}
