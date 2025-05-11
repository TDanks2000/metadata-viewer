import { MetadataViewer } from "@/components/metadata-viewer";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
	return (
		<HydrateClient>
			<div className="container mx-auto py-10">
				<MetadataViewer />
			</div>
		</HydrateClient>
	);
}
