import { parse } from "node-html-parser";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Define a more comprehensive metadata schema
const MetadataSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	image: z.string().optional(),
	url: z.string().url(),
	canonical: z.string().optional(),
	siteName: z.string().optional(),
	type: z.string().optional(),
	author: z.string().optional(),
	language: z.string().optional(),
	keywords: z.array(z.string()).default([]),
	publishedTime: z.string().optional(),
	modifiedTime: z.string().optional(),
	favicon: z.string().optional(),
	themeColor: z.string().optional(),
	twitterCard: z.string().optional(),
	twitterSite: z.string().optional(),
	twitterCreator: z.string().optional(),
	robots: z.string().optional(),
	viewport: z.string().optional(),
	structuredData: z.array(z.record(z.any())).default([]),
	openGraph: z.record(z.string(), z.string()).default({}),
	metaTags: z.record(z.string(), z.string()).default({}),
});

export type Metadata = z.infer<typeof MetadataSchema>;

export const metadataRouter = createTRPCRouter({
	fetchMetadata: publicProcedure
		.input(
			z.object({
				url: z.string().url(),
				timeout: z.number().min(1000).max(10000).default(5000),
				userAgent: z.string().default("Metadata-Viewer/1.0"),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Validate URL format
				const urlObj = new URL(input.url);

				// Set up fetch with timeout and user agent
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), input.timeout);

				const response = await fetch(urlObj.toString(), {
					headers: {
						"User-Agent": input.userAgent,
						Accept: "text/html,application/xhtml+xml",
						"Accept-Language": "en-US,en;q=0.9",
					},
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`Failed to fetch URL: ${response.status}`);
				}

				const contentType = response.headers.get("content-type") || "";
				if (!contentType.includes("text/html")) {
					throw new Error(`URL does not return HTML content: ${contentType}`);
				}

				const html = await response.text();
				const metadata = await extractMetadata(html, urlObj.toString());

				return metadata;
			} catch (error) {
				console.error("Error fetching metadata:", error);
				if (error instanceof Error) {
					throw new Error(
						`Failed to fetch or parse metadata: ${error.message}`,
					);
				}
				throw new Error("Failed to fetch or parse metadata");
			}
		}),
});

async function extractMetadata(html: string, url: string): Promise<Metadata> {
	// Initialize with default values
	const result: Metadata = {
		title: "",
		description: "",
		image: "",
		url: url,
		canonical: "",
		siteName: "",
		type: "",
		author: "",
		language: "",
		keywords: [],
		publishedTime: "",
		modifiedTime: "",
		favicon: "",
		themeColor: "",
		twitterCard: "",
		twitterSite: "",
		twitterCreator: "",
		robots: "",
		viewport: "",
		structuredData: [],
		openGraph: {},
		metaTags: {},
	};

	try {
		// Parse HTML with node-html-parser
		const root = parse(html);

		// Helper function to get meta content
		const getMetaContent = (name: string, property: string): string => {
			return (
				root.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ||
				root
					.querySelector(`meta[property="${property}"]`)
					?.getAttribute("content") ||
				""
			);
		};

		// Extract basic metadata
		result.title = root.querySelector("title")?.text || "";
		result.description = getMetaContent("description", "og:description");
		result.image = getMetaContent("image", "og:image");
		result.siteName = getMetaContent("application-name", "og:site_name");
		result.type = getMetaContent("type", "og:type");
		result.author =
			getMetaContent("author", "article:author") ||
			root.querySelector("address")?.text ||
			root.querySelector('[rel="author"]')?.text ||
			"";
		result.language = root.querySelector("html")?.getAttribute("lang") || "";
		result.canonical =
			root.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
		result.publishedTime =
			getMetaContent("article:published_time", "article:published_time") ||
			getMetaContent("datePublished", "og:published_time");
		result.modifiedTime =
			getMetaContent("article:modified_time", "article:modified_time") ||
			getMetaContent("dateModified", "og:modified_time");

		// Extract favicon
		const faviconLink =
			root.querySelector('link[rel="icon"]') ||
			root.querySelector('link[rel="shortcut icon"]');
		if (faviconLink) {
			const faviconHref = faviconLink.getAttribute("href");
			if (faviconHref) {
				// Handle relative URLs
				try {
					result.favicon = new URL(faviconHref, url).toString();
				} catch {
					result.favicon = faviconHref;
				}
			}
		}

		// Extract theme color
		result.themeColor = getMetaContent("theme-color", "theme-color");

		// Extract Twitter card metadata
		result.twitterCard = getMetaContent("twitter:card", "twitter:card");
		result.twitterSite = getMetaContent("twitter:site", "twitter:site");
		result.twitterCreator = getMetaContent(
			"twitter:creator",
			"twitter:creator",
		);

		// Extract robots and viewport
		result.robots = getMetaContent("robots", "robots");
		result.viewport = getMetaContent("viewport", "viewport");

		// Extract keywords
		const keywordsContent = getMetaContent("keywords", "");
		if (keywordsContent) {
			result.keywords = keywordsContent
				.split(",")
				.map((k) => k.trim())
				.filter(Boolean);
		}

		// Extract all Open Graph tags
		const ogTags = root.querySelectorAll('meta[property^="og:"]');
		ogTags.forEach((tag) => {
			const property = tag.getAttribute("property");
			const content = tag.getAttribute("content");
			if (property && content) {
				result.openGraph[property] = content;
			}
		});

		// Extract all meta tags
		const metaTags = root.querySelectorAll("meta");
		metaTags.forEach((tag) => {
			const name = tag.getAttribute("name") || tag.getAttribute("property");
			const content = tag.getAttribute("content");
			if (name && content) {
				result.metaTags[name] = content;
			}
		});

		// Extract structured data (JSON-LD)
		const jsonLdScripts = root.querySelectorAll(
			'script[type="application/ld+json"]',
		);
		jsonLdScripts.forEach((script) => {
			try {
				const jsonContent = JSON.parse(script.text);
				result.structuredData.push(jsonContent);
			} catch (e) {
				console.warn("Failed to parse JSON-LD script:", e);
			}
		});

		// Try to extract additional information if basic metadata is missing
		if (!result.title) {
			// Try to find the most prominent heading
			const h1 = root.querySelector("h1");
			if (h1) result.title = h1.text.trim();
		}

		if (!result.description) {
			// Try to extract from first paragraph
			const firstParagraph = root.querySelector("p");
			if (firstParagraph) {
				const text = firstParagraph.text.trim();
				if (text.length > 10) {
					result.description = text.substring(0, 200);
					if (text.length > 200) result.description += "...";
				}
			}
		}

		if (!result.image) {
			// Try to find the first large image
			const images = root.querySelectorAll("img");
			for (const img of images) {
				const src = img.getAttribute("src");
				const width = Number.parseInt(img.getAttribute("width") || "0", 10);
				const height = Number.parseInt(img.getAttribute("height") || "0", 10);

				// Look for reasonably sized images
				if (src && (width > 200 || height > 200 || !width || !height)) {
					try {
						result.image = new URL(src, url).toString();
						break;
					} catch {
						result.image = src;
						break;
					}
				}
			}
		}
	} catch (error) {
		console.error("Error parsing HTML:", error);
	}

	return result;
}
