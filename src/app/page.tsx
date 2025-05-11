import { MetadataViewer } from "@/features/metadata/components/MetadataViewer";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
	return (
		<HydrateClient>
			<div className="container mx-auto px-5 py-10">
				<MetadataViewer />
			</div>
		</HydrateClient>
	);
}
