import { FileSearch, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MetadataFormProps = {
	url: string;
	setUrl: (value: string) => void;
	isLoading: boolean;
	handleSubmit: (e: React.FormEvent) => void;
	isFormCentered: boolean;
};

export function MetadataForm({
	url,
	setUrl,
	isLoading,
	handleSubmit,
	isFormCentered,
}: MetadataFormProps) {
	return (
		<form
			onSubmit={handleSubmit}
			className={cn(
				"w-full max-w-xl transition-all duration-500 ease-in-out",
				isFormCentered ? "scale-100" : "mx-auto mb-5 scale-95 transform",
			)}
		>
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Globe className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
					<Input
						type="url"
						placeholder="Enter URL to fetch metadata"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						required
						className="flex-1 pl-9"
					/>
				</div>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="animate-spin" />
							Loading
						</>
					) : (
						<>
							<FileSearch />
							Fetch
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
