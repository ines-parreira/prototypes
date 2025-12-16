import { NEW_GUIDANCE_ARTICLE_LIMIT } from 'pages/aiAgent/constants'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'

import { calculateGuidanceLimit } from '../guidanceLimitUtils'

describe('calculateGuidanceLimit', () => {
    const createMockGuidanceArticle = (
        visibility: 'PUBLIC' | 'UNLISTED',
    ): FilteredKnowledgeHubArticle => ({
        id: Math.floor(Math.random() * 1000),
        title: 'Test Guidance',
        visibility,
        draftVersionId: null,
        publishedVersionId: null,
    })

    it('returns correct count when no guidance articles exist', () => {
        const result = calculateGuidanceLimit([])

        expect(result.activeGuidanceCount).toBe(0)
        expect(result.isAtLimit).toBe(false)
        expect(result.limit).toBe(NEW_GUIDANCE_ARTICLE_LIMIT)
    })

    it('returns correct count when all guidance are unlisted', () => {
        const articles = Array.from({ length: 50 }, () =>
            createMockGuidanceArticle('UNLISTED'),
        )

        const result = calculateGuidanceLimit(articles)

        expect(result.activeGuidanceCount).toBe(0)
        expect(result.isAtLimit).toBe(false)
    })

    it('returns correct count when some guidance are public', () => {
        const articles = [
            ...Array.from({ length: 30 }, () =>
                createMockGuidanceArticle('PUBLIC'),
            ),
            ...Array.from({ length: 20 }, () =>
                createMockGuidanceArticle('UNLISTED'),
            ),
        ]

        const result = calculateGuidanceLimit(articles)

        expect(result.activeGuidanceCount).toBe(30)
        expect(result.isAtLimit).toBe(false)
    })

    it('returns isAtLimit=true when exactly at the limit', () => {
        const articles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT },
            () => createMockGuidanceArticle('PUBLIC'),
        )

        const result = calculateGuidanceLimit(articles)

        expect(result.activeGuidanceCount).toBe(NEW_GUIDANCE_ARTICLE_LIMIT)
        expect(result.isAtLimit).toBe(true)
    })

    it('returns isAtLimit=true when over the limit', () => {
        const articles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT + 10 },
            () => createMockGuidanceArticle('PUBLIC'),
        )

        const result = calculateGuidanceLimit(articles)

        expect(result.activeGuidanceCount).toBe(NEW_GUIDANCE_ARTICLE_LIMIT + 10)
        expect(result.isAtLimit).toBe(true)
    })

    it('returns isAtLimit=false when one below the limit', () => {
        const articles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT - 1 },
            () => createMockGuidanceArticle('PUBLIC'),
        )

        const result = calculateGuidanceLimit(articles)

        expect(result.activeGuidanceCount).toBe(NEW_GUIDANCE_ARTICLE_LIMIT - 1)
        expect(result.isAtLimit).toBe(false)
    })

    it('returns correct limit message', () => {
        const result = calculateGuidanceLimit([])

        expect(result.limitMessage).toBe(
            `You've reached the limit of ${NEW_GUIDANCE_ARTICLE_LIMIT} enabled Guidances. To enable this one, disable another.`,
        )
    })
})
