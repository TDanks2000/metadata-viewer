import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const metadataRouter = createTRPCRouter({
	fetchMetadata: publicProcedure
		.input(z.object({ url: z.string().url() }))
		.mutation(async ({ input }) => {
			try {
				// Validate URL format
				const urlObj = new URL(input.url);
				const response = await fetch(urlObj.toString(), {
					headers: {
						"User-Agent": "Metadata-Viewer/1.0",
					},
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch URL: ${response.status}`);
				}

				const html = await response.text();
				const metadata = extractMetadata(html, urlObj.toString());

				return metadata;
			} catch (error) {
				console.error("Error fetching metadata:", error);
				throw new Error("Failed to fetch or parse metadata");
			}
		}),
});

// We need to install jsdom for server-side HTML parsing
import { JSDOM } from "jsdom";

async function extractMetadata(html: string, url: string) {
	const result = {
		title: "",
		description: "",
		image: "",
		url: url,
		siteName: "",
		type: "",
		author: "",
		keywords: [] as string[],
		other: {} as Record<string, string>,
	};

	try {
		// Create a virtual DOM using jsdom
		const dom = new JSDOM(html);
		const doc = dom.window.document;

		// Helper function to get meta content
		const getMetaContent = (name: string, property: string) => {
			return (
				doc.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ||
				doc
					.querySelector(`meta[property="${property}"]`)
					?.getAttribute("content") ||
				""
			);
		};

		// Extract basic metadata
		result.title = doc.querySelector("title")?.textContent || "";
		result.description = getMetaContent("description", "og:description");
		result.image = getMetaContent("image", "og:image");
		result.siteName = getMetaContent("application-name", "og:site_name");
		result.type = getMetaContent("type", "og:type");
		result.author = getMetaContent("author", "article:author");

		// Extract keywords
		const keywordsContent = getMetaContent("keywords", "");
		if (keywordsContent) {
			result.keywords = keywordsContent
				.split(",")
				.map((k) => k.trim())
				.filter(Boolean);
		}

		// Extract all meta tags for 'other' category
		const metaTags = doc.querySelectorAll("meta");
		metaTags.forEach((tag) => {
			const name = tag.getAttribute("name") || tag.getAttribute("property");
			const content = tag.getAttribute("content");

			if (name && content) {
				// Skip already extracted metadata
				if (
					![
						"description",
						"og:description",
						"image",
						"og:image",
						"application-name",
						"og:site_name",
						"type",
						"og:type",
						"author",
						"article:author",
						"keywords",
					].includes(name)
				) {
					result.other[name] = content;
				}
			}
		});
	} catch (error) {
		console.error("Error parsing HTML:", error);
	}

	return result;
}
