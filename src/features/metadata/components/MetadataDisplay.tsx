import {
	Building,
	ExternalLink,
	FileType,
	Info,
	Link,
	Tag,
	User,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

export function MetadataDisplay({ metadata }: { metadata: MetadataResult }) {
	return (
		<div
			className={cn(
				"mx-auto grid w-full max-w-4xl gap-6 transition-all duration-500 ease-in-out",
				"fade-in slide-in-from-bottom-4 animate-in duration-700",
			)}
		>
			<Card className="pt-0">
				{metadata.image && (
					<div className="relative h-80 w-full overflow-hidden rounded-t-lg">
						<Image
							src={metadata.image}
							alt={metadata.title || "Website preview"}
							className="w-full object-cover"
							fill
							sizes="(max-width: 768px) 100vw, 768px"
							priority
						/>
						{metadata.siteName && (
							<Badge
								variant="secondary"
								className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/70 text-white"
							>
								<Building className="h-3 w-3" />
								{metadata.siteName}
							</Badge>
						)}
					</div>
				)}

				<CardHeader>
					<CardTitle className="line-clamp-2">
						{metadata.title || "No title found"}
					</CardTitle>
					<CardDescription className="line-clamp-3">
						{metadata.description || "No description found"}
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-6">
					<div className="flex flex-wrap items-center gap-3">
						{metadata.url && (
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									asChild
									className="inline-flex items-center gap-1.5"
								>
									<a
										href={metadata.url}
										target="_blank"
										rel="noopener noreferrer"
										title={metadata.url}
									>
										<Link className="h-3.5 w-3.5" />
										Visit Website
										<ExternalLink className="ml-1 h-3 w-3 opacity-70" />
									</a>
								</Button>
							</div>
						)}

						{metadata.type && (
							<Badge variant="outline" className="flex items-center gap-1.5">
								<FileType className="h-3.5 w-3.5" />
								{metadata.type}
							</Badge>
						)}

						{metadata.author && (
							<Badge variant="outline" className="flex items-center gap-1.5">
								<User className="h-3.5 w-3.5" />
								{metadata.author}
							</Badge>
						)}
					</div>

					{!!metadata.keywords?.length && (
						<Card>
							<CardHeader className="flex flex-row items-center gap-2 pb-2">
								<Tag className="h-4 w-4" />
								<CardTitle className="text-sm">Keywords</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{metadata.keywords.map((keyword) => (
										<Badge
											key={keyword}
											variant="secondary"
											className="rounded-md px-2.5 py-1 text-xs"
										>
											{keyword}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{Object.keys(metadata.other).length > 0 && (
						<Card>
							<CardHeader className="flex flex-row items-center gap-2 pb-2">
								<Info className="h-4 w-4" />
								<CardTitle className="text-sm">Additional Metadata</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{Object.entries(metadata.other).map(([key, value], index) => (
										<div
											key={key}
											className="space-y-1 rounded-md border border-border bg-muted p-3"
										>
											<div className="flex items-center justify-between">
												<p className="font-medium text-muted-foreground text-xs uppercase">
													{key}
												</p>
												<CopyButton
													content={value}
													copyMessage={`${key} value copied`}
												/>
											</div>
											<p className="break-all text-sm">{value}</p>
											{index < Object.entries(metadata.other).length - 1 && (
												<Separator className="mt-2 sm:hidden" />
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
