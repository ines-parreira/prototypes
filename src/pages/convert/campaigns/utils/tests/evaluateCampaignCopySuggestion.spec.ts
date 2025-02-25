import { computeTextSimilarityScore } from 'pages/convert/campaigns/utils/computeTextSimilarityScore'

import {
    evaluateCampaignCopySuggestion,
    SIMILARITY_THRESHOLD,
} from '../evaluateCampaignCopySuggestion'

jest.mock('pages/convert/campaigns/utils/computeTextSimilarityScore')

describe('evaluateCampaignCopySuggestion', () => {
    it('should return the suggestion if similarity score is below the threshold', () => {
        ;(computeTextSimilarityScore as jest.Mock).mockReturnValue(
            SIMILARITY_THRESHOLD - 0.01,
        )

        const result = evaluateCampaignCopySuggestion(
            'campaign message',
            'suggestion',
        )

        expect(result).toBe('suggestion')
    })

    it('should return null if similarity score is above the threshold', () => {
        ;(computeTextSimilarityScore as jest.Mock).mockReturnValue(
            SIMILARITY_THRESHOLD + 0.01,
        )

        const result = evaluateCampaignCopySuggestion(
            'campaign message',
            'suggestion',
        )

        expect(result).toBeNull()
    })

    it('should handle null suggestion correctly', () => {
        ;(computeTextSimilarityScore as jest.Mock).mockReturnValue(1)

        const result = evaluateCampaignCopySuggestion('campaign message', null)

        expect(result).toBeNull()
    })

    it('should handle empty campaign message correctly', () => {
        ;(computeTextSimilarityScore as jest.Mock).mockReturnValue(1)

        const result = evaluateCampaignCopySuggestion('', 'suggestion')

        expect(result).toBeNull()
    })
})
