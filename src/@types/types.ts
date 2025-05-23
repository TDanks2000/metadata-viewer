import type { RouterOutputs } from "@/trpc/react";

export type MetadataResult = RouterOutputs["metadata"]["fetchMetadata"];

export type SearchParams = {
	url?: string;
}
