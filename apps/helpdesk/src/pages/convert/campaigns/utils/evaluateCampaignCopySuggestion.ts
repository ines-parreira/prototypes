import { computeTextSimilarityScore } from 'pages/convert/campaigns/utils/computeTextSimilarityScore'

export const SIMILARITY_THRESHOLD = 0.2

export const evaluateCampaignCopySuggestion = (
    campaignMessage: string,
    suggestion: string | null,
): string | null => {
    const similarityScore = computeTextSimilarityScore(
        campaignMessage,
        suggestion || '',
    )

    return similarityScore < SIMILARITY_THRESHOLD ? suggestion : null
}
