import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

/**
 * Type for a single <url> entry in a sitemap.
 */
type SitemapUrlEntry = {
	loc: string | string[];
};

/**
 * Type for the parsed sitemap structure.
 */
type SitemapParsed = {
	urlset?: {
		url?: SitemapUrlEntry | SitemapUrlEntry[];
	};
};

/**
 * The result for each URL: its address and whether it's crawlable.
 */
type CrawlResult = {
	url: string;
	crawlable: boolean;
};

/**
 * Parse robots.txt and return Disallow rules for User-agent: *
 */
function parseRobotsTxt(robotsTxt: string): string[] {
	const lines = robotsTxt.split("\n");
	const rules: string[] = [];
	let userAgentRelevant = false;

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed.toLowerCase().startsWith("user-agent:")) {
			// Only care about User-agent: *
			const agent = trimmed.split(":")[1]?.trim().toLowerCase();
			userAgentRelevant = agent === "*";
		} else if (
			userAgentRelevant &&
			trimmed.toLowerCase().startsWith("disallow:")
		) {
			// Only collect Disallow rules under User-agent: *
			const path = trimmed.split(":")[1]?.trim();
			if (path) rules.push(path);
		}
	}
	return rules;
}

/**
 * Determine if a URL is crawlable based on Disallow rules.
 */
function isCrawlable(
	url: string,
	siteUrl: string,
	disallowRules: string[],
): boolean {
	// Get the path part of the URL
	let path = url.startsWith(siteUrl) ? url.slice(siteUrl.length) : url;
	if (!path.startsWith("/")) path = `/${path}`;

	for (const rule of disallowRules) {
		if (!rule) continue;
		if (rule === "/") return false;
		if (path.startsWith(rule)) return false;
	}
	return true;
}

/**
 * tRPC router for sitemap and robots.txt analysis.
 */
export const sitemapRouter = createTRPCRouter({
	checkSitemap: publicProcedure
		.input(z.object({ siteUrl: z.string().url() }))
		.mutation(async ({ input }: { input: { siteUrl: string } }) => {
			const { siteUrl } = input;

			// Fetch robots.txt
			const robotsUrl = new URL("/robots.txt", siteUrl).href;
			const robotsRes = await fetch(robotsUrl).catch(() => null);
			const robotsTxt = robotsRes?.ok ? await robotsRes.text() : "";
			const disallowRules = parseRobotsTxt(robotsTxt);

			// Fetch sitemap.xml
			const sitemapUrl = new URL("/sitemap.xml", siteUrl).href;
			const sitemapRes = await fetch(sitemapUrl).catch(() => null);
			if (!sitemapRes || !sitemapRes.ok) {
				throw new Error("Could not fetch sitemap.xml");
			}

			// Parse sitemap.xml
			const xml = await sitemapRes.text();
			const parser = new XMLParser();
			const sitemap = parser.parse(xml) as SitemapParsed;

			// Extract URLs from the sitemap
			let urls: string[] = [];
			const urlset = sitemap.urlset?.url;
			if (Array.isArray(urlset)) {
				urls = urlset
					.map((u) =>
						typeof u.loc === "string"
							? u.loc
							: Array.isArray(u.loc)
								? u.loc[0]
								: undefined,
					)
					.filter((u): u is string => typeof u === "string");
			} else if (urlset && typeof urlset.loc === "string") {
				urls = [urlset.loc];
			} else if (urlset && Array.isArray(urlset.loc)) {
				const first = urlset.loc[0];
				if (typeof first === "string") {
					urls = [first];
				}
			}

			// Map each URL to its crawlability status
			const results: CrawlResult[] = urls.map((url) => ({
				url,
				crawlable: isCrawlable(url, siteUrl, disallowRules),
			}));

			return results;
		}),
});
