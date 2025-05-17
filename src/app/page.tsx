import type { SearchParams } from "@/@types";
import { MetadataViewer } from "@/features/metadata/components/MetadataViewer";
import { HydrateClient } from "@/trpc/server";

type Props = {
	searchParams: Promise<SearchParams>;
};

export default async function Home({ searchParams }: Props) {
	const params = await searchParams;

	return (
		<HydrateClient>
			<div className="container mx-auto px-5 py-10">
				<MetadataViewer initialUrl={params.url} />
			</div>
		</HydrateClient>
	);
}
