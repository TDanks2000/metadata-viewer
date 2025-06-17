import { parse } from "node-html-parser";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// Define a strict type for our result items to ensure type safety
type ResultStatus = "pass" | "fail" | "warn";

// Add an optional subChecks property to our ResultItem type
interface ResultItem {
	title: string;
	status: ResultStatus;
	message: string;
	isCritical: boolean;
	subChecks?: {
		text: string;
		status: boolean;
	}[];
}

export const adsenseRouter = createTRPCRouter({
	checkAdsense: publicProcedure
		.input(z.object({ url: z.string().url() }))
		.query(async ({ input }) => {
			try {
				const mainPageResponse = await fetch(input.url, {
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
					},
				});

				if (!mainPageResponse.ok) {
					return {
						error: `Failed to fetch the main site URL: ${mainPageResponse.statusText}`,
						results: [],
					};
				}

				const mainPageHtml = await mainPageResponse.text();
				const root = parse(mainPageHtml);
				const bodyText = root.querySelector("body")?.text ?? "";

				const results: ResultItem[] = [];
				let score = 0;
				const totalChecks = 8;

				// --- Critical Technical Checks ---
				const isHttps = input.url.startsWith("https://");
				results.push({
					title: "Uses HTTPS (SSL)",
					status: isHttps ? "pass" : "fail",
					message: isHttps
						? "Your site is secure, which is a fundamental requirement."
						: "Your site must use HTTPS. Get a free SSL certificate from your host.",
					isCritical: true,
				});
				if (isHttps) score++;

				const hasNoIndexTag =
					root.querySelector('meta[name="robots"][content*="noindex"]') !==
					null;
				results.push({
					title: "Site is Indexable",
					status: !hasNoIndexTag ? "pass" : "fail",
					message: !hasNoIndexTag
						? "Your site is not blocking search engines from indexing it."
						: "A 'noindex' meta tag was found, which tells Google not to list your site. This must be removed.",
					isCritical: true,
				});
				if (!hasNoIndexTag) score++;

				const hasViewportTag =
					root.querySelector('meta[name="viewport"]') !== null;
				results.push({
					title: "Mobile Viewport",
					status: hasViewportTag ? "pass" : "warn",
					message: hasViewportTag
						? "A viewport tag was found, which is essential for mobile-friendliness."
						: "The viewport meta tag is missing. Your site may not render correctly on mobile devices.",
					isCritical: false,
				});
				if (hasViewportTag) score++;

				// --- Content Quality Checks ---
				const wordCount = bodyText.trim().split(/\s+/).length;
				const hasSufficientContent = wordCount > 700;
				results.push({
					title: "Sufficient Content",
					status: hasSufficientContent ? "pass" : "fail",
					message: `Found ~${wordCount} words on the homepage. Aim for at least 700 words of high-quality content per page.`,
					isCritical: true,
				});
				if (hasSufficientContent) score++;

				// --- Site Structure & Trust Signals ---
				const hasAbout = root.querySelectorAll('a[href*="about"]').length > 0;
				const hasContact =
					root.querySelectorAll('a[href*="contact"]').length > 0;
				const hasPrivacy =
					root.querySelectorAll('a[href*="privacy"], a[href*="policy"]')
						.length > 0;
				const hasEssentialPages = hasAbout && hasContact && hasPrivacy;
				results.push({
					title: "Essential Pages",
					status: hasEssentialPages ? "pass" : "fail",
					message:
						"Your site must have these pages to build trust with users and advertisers.",
					isCritical: true,
					// Add the detailed sub-list here
					subChecks: [
						{ text: "About Page", status: hasAbout },
						{ text: "Contact Page", status: hasContact },
						{ text: "Privacy Policy", status: hasPrivacy },
					],
				});
				if (hasEssentialPages) score++;

				const hasNav = root.querySelector("nav") !== null;
				const navLinkCount =
					root.querySelector("nav")?.querySelectorAll("a").length ?? 0;
				const hasGoodNavigation = hasNav && navLinkCount > 2;
				results.push({
					title: "Clear Navigation",
					status: hasGoodNavigation ? "pass" : "fail",
					message: hasGoodNavigation
						? `A <nav> element with ${navLinkCount} links was found.`
						: "A clear navigation menu (<nav>) with multiple links is needed for users to explore your site.",
					isCritical: true,
				});
				if (hasGoodNavigation) score++;

				const hasFooter = root.querySelector("footer") !== null;
				results.push({
					title: "Complete Site Structure",
					status: hasFooter ? "pass" : "warn",
					message: hasFooter
						? "A <footer> element was found, signaling a complete site design."
						: "A site footer is expected on a complete, professional website.",
					isCritical: false,
				});
				if (hasFooter) score++;

				const hasAnalytics = /gtag\.js|analytics\.js/.test(mainPageHtml);
				results.push({
					title: "Traffic Analytics",
					status: hasAnalytics ? "pass" : "warn",
					message: hasAnalytics
						? "Google Analytics seems to be installed, a good sign of a serious project."
						: "Installing analytics helps you understand your audience, which is key to creating valuable content.",
					isCritical: false,
				});
				if (hasAnalytics) score++;

				let recommendation = "Significant improvements are required.";
				if (score >= 7) {
					recommendation =
						"Excellent! This site shows strong signals for AdSense approval.";
				} else if (score >= 5) {
					recommendation =
						"Good foundation. Address the warnings and failures to improve your chances.";
				} else if (score >= 3) {
					recommendation =
						"Several critical issues were found that will likely lead to rejection.";
				}

				return {
					results,
					summary: { score, total: totalChecks, recommendation },
				};
			} catch (error) {
				console.error("Error in checkAdsense:", error);
				return {
					error:
						(error instanceof Error ? error.message : String(error)) ??
						"An unknown server error occurred",
					results: [],
				};
			}
		}),
});
