import { useMemo } from "react";
import type { RouterOutputs } from "@/trpc/react";

type ImportanceLevel = "high" | "medium" | "low";

type ScoreCategory = {
	score: number;
	feedback: string;
	importance: ImportanceLevel;
};

type MetadataScore = {
	totalScore: number;
	categories: {
		title: ScoreCategory;
		description: ScoreCategory;
		keywords: ScoreCategory;
		image: ScoreCategory;
		social: ScoreCategory;
		technical: ScoreCategory;
	};
};

type MetadataResult = RouterOutputs["metadata"]["fetchMetadata"];

export function useMetadataScore(
	metadata: MetadataResult | null,
): MetadataScore {
	return useMemo(() => {
		if (!metadata) {
			// Handle null metadata case with default empty scores
			const emptyScore: ScoreCategory = {
				score: 0,
				feedback: "No metadata available",
				importance: "high",
			};

			return {
				totalScore: 0,
				categories: {
					title: emptyScore,
					description: emptyScore,
					keywords: emptyScore,
					image: emptyScore,
					social: emptyScore,
					technical: emptyScore,
				},
			};
		}

		const scores = {
			title: scoreTitleQuality(metadata.title),
			description: scoreDescriptionQuality(metadata.description),
			keywords: scoreKeywordsQuality(metadata.keywords),
			image: scoreImageQuality(metadata.image),
			social: scoreSocialMetadata(metadata),
			technical: scoreTechnicalMetadata(metadata),
		};

		const totalScore = calculateTotalScore(scores);

		return {
			totalScore,
			categories: scores,
		};
	}, [metadata]);
}

function scoreTitleQuality(title?: string): ScoreCategory {
	if (!title || title.trim() === "") {
		return {
			score: 0,
			feedback: "Title is missing",
			importance: "high",
		};
	}

	const length = title.length;

	if (length < 10) {
		return {
			score: 30,
			feedback: "Title is too short (recommended: 30-60 characters)",
			importance: "high",
		};
	}

	if (length < 30) {
		return {
			score: 60,
			feedback: "Title is slightly short (recommended: 30-60 characters)",
			importance: "high",
		};
	}

	if (length > 60 && length <= 70) {
		return {
			score: 80,
			feedback: "Title is slightly long (recommended: 30-60 characters)",
			importance: "high",
		};
	}

	if (length > 70) {
		return {
			score: 50,
			feedback: "Title is too long and may be truncated in search results",
			importance: "high",
		};
	}

	return {
		score: 100,
		feedback: "Title length is optimal",
		importance: "high",
	};
}

function scoreDescriptionQuality(description?: string): ScoreCategory {
	if (!description || description.trim() === "") {
		return {
			score: 0,
			feedback: "Description is missing",
			importance: "high",
		};
	}

	const length = description.length;

	if (length < 70) {
		return {
			score: 30,
			feedback: "Description is too short (recommended: 120-160 characters)",
			importance: "high",
		};
	}

	if (length < 120) {
		return {
			score: 60,
			feedback:
				"Description is slightly short (recommended: 120-160 characters)",
			importance: "high",
		};
	}

	if (length > 160 && length <= 180) {
		return {
			score: 80,
			feedback:
				"Description is slightly long (recommended: 120-160 characters)",
			importance: "high",
		};
	}

	if (length > 180) {
		return {
			score: 50,
			feedback:
				"Description is too long and may be truncated in search results",
			importance: "high",
		};
	}

	return {
		score: 100,
		feedback: "Description length is optimal",
		importance: "high",
	};
}

function scoreKeywordsQuality(keywords?: string[]): ScoreCategory {
	if (!keywords || !keywords.length) {
		return {
			score: 0,
			feedback: "No keywords found",
			importance: "medium",
		};
	}

	// Filter out empty keywords
	const validKeywords = keywords.filter((k) => k && k.trim() !== "");

	if (validKeywords.length === 0) {
		return {
			score: 0,
			feedback: "No valid keywords found",
			importance: "medium",
		};
	}

	if (validKeywords.length < 3) {
		return {
			score: 40,
			feedback: "Too few keywords (recommended: 5-10 keywords)",
			importance: "medium",
		};
	}

	if (validKeywords.length < 5) {
		return {
			score: 70,
			feedback: "Could use more keywords (recommended: 5-10 keywords)",
			importance: "medium",
		};
	}

	if (validKeywords.length > 10 && validKeywords.length <= 15) {
		return {
			score: 80,
			feedback: "Slightly too many keywords (recommended: 5-10 keywords)",
			importance: "medium",
		};
	}

	if (validKeywords.length > 15) {
		return {
			score: 50,
			feedback: "Too many keywords may be considered keyword stuffing",
			importance: "medium",
		};
	}

	return {
		score: 100,
		feedback: "Good number of keywords",
		importance: "medium",
	};
}

function scoreImageQuality(image?: string): ScoreCategory {
	if (!image || image.trim() === "") {
		return {
			score: 0,
			feedback: "No featured image found",
			importance: "medium",
		};
	}

	// Check if image URL is valid
	try {
		new URL(image);
		return {
			score: 100,
			feedback: "Featured image is present",
			importance: "medium",
		};
	} catch {
		return {
			score: 50,
			feedback: "Featured image URL may be invalid",
			importance: "medium",
		};
	}
}

function scoreSocialMetadata(metadata: MetadataResult): ScoreCategory {
	const socialElements = [
		{ value: metadata.title, name: "title" },
		{ value: metadata.description, name: "description" },
		{ value: metadata.image, name: "image" },
		{ value: metadata.siteName, name: "site name" },
	];

	const missingElements = socialElements
		.filter((el) => !el.value || el.value.trim() === "")
		.map((el) => el.name);

	const presentCount = socialElements.length - missingElements.length;
	const score = Math.round((presentCount / socialElements.length) * 100);

	let feedback = "";
	if (score === 100) {
		feedback = "All social metadata elements are present";
	} else if (score >= 75) {
		feedback = `Most social metadata elements are present, missing: ${missingElements.join(", ")}`;
	} else if (score >= 50) {
		feedback = `Several social metadata elements are missing: ${missingElements.join(", ")}`;
	} else {
		feedback = "Most social metadata elements are missing";
	}

	return {
		score,
		feedback,
		importance: "medium",
	};
}

function scoreTechnicalMetadata(metadata: MetadataResult): ScoreCategory {
	const technicalElements = [
		{ value: metadata.type, name: "type" },
		{ value: metadata.author, name: "author" },
		{ value: metadata.url, name: "URL" },
		{ value: metadata.canonical, name: "canonical URL" },
		{ value: metadata.language, name: "language" },
	];

	const missingElements = technicalElements
		.filter((el) => !el.value || el.value.trim() === "")
		.map((el) => el.name);

	const presentCount = technicalElements.length - missingElements.length;
	const score = Math.round((presentCount / technicalElements.length) * 100);

	let feedback = "";
	if (score === 100) {
		feedback = "All technical metadata elements are present";
	} else if (score >= 60) {
		feedback = `Some technical metadata elements are missing: ${missingElements.join(", ")}`;
	} else {
		feedback = "Many technical metadata elements are missing";
	}

	return {
		score,
		feedback,
		importance: "low",
	};
}

function calculateTotalScore(scores: MetadataScore["categories"]): number {
	// Define weights for each importance level
	const importanceWeights: Record<ImportanceLevel, number> = {
		high: 0.5,
		medium: 0.3,
		low: 0.2,
	};

	// Define weights for each category (optional refinement)
	const categoryWeights = {
		title: 1.2, // Extra weight for title
		description: 1.1, // Extra weight for description
		keywords: 0.9,
		image: 1.0,
		social: 0.9,
		technical: 0.8,
	};

	let totalWeightedScore = 0;
	let totalWeight = 0;

	// Calculate weighted score for each category
	for (const [category, data] of Object.entries(scores) as [
		keyof typeof scores,
		ScoreCategory,
	][]) {
		const weight =
			importanceWeights[data.importance] * categoryWeights[category];
		totalWeightedScore += data.score * weight;
		totalWeight += weight;
	}

	// Return rounded weighted average
	return Math.round(totalWeightedScore / totalWeight);
}
