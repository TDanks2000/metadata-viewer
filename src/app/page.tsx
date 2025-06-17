import type { SearchParams } from "@/@types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdsenseChecker } from "@/features/adsense/AdsenseChecker";
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
				<Tabs defaultValue="metadata" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="metadata">Metadata Viewer</TabsTrigger>
						<TabsTrigger value="adsense">AdSense Checker</TabsTrigger>
					</TabsList>
					<TabsContent value="metadata">
						<MetadataViewer initialUrl={params.url} />
					</TabsContent>
					<TabsContent value="adsense">
						<AdsenseChecker />
					</TabsContent>
				</Tabs>
			</div>
		</HydrateClient>
	);
}
