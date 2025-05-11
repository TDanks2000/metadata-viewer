import { useState } from "react";
import type { MetadataResult } from "@/@types";
import { api } from "@/trpc/react";

export function useMetadataFetcher() {
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

	return {
		url,
		setUrl,
		isLoading,
		metadata,
		isFormCentered,
		setIsFormCentered,
		handleSubmit,
	};
}
