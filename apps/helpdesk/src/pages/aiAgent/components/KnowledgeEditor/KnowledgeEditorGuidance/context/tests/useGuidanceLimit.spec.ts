import { renderHook } from '@testing-library/react'

import { NEW_GUIDANCE_ARTICLE_LIMIT } from 'pages/aiAgent/constants'
import type { FilteredKnowledgeHubArticle } from 'pages/aiAgent/KnowledgeHub/types'

import { useGuidanceLimit } from '../useGuidanceLimit'

describe('useGuidanceLimit', () => {
    const createMockGuidanceArticle = (
        visibility: 'PUBLIC' | 'UNLISTED',
    ): FilteredKnowledgeHubArticle => ({
        id: Math.floor(Math.random() * 1000),
        title: 'Test Guidance',
        visibility,
        draftVersionId: null,
        publishedVersionId: null,
    })

    it('returns correct values when no guidance articles exist', () => {
        const { result } = renderHook(() => useGuidanceLimit([]))

        expect(result.current.activeGuidanceCount).toBe(0)
        expect(result.current.isAtLimit).toBe(false)
        expect(result.current.limit).toBe(NEW_GUIDANCE_ARTICLE_LIMIT)
        expect(result.current.limitMessage).toBeDefined()
    })

    it('returns correct values when below limit', () => {
        const articles = Array.from({ length: 50 }, () =>
            createMockGuidanceArticle('PUBLIC'),
        )

        const { result } = renderHook(() => useGuidanceLimit(articles))

        expect(result.current.activeGuidanceCount).toBe(50)
        expect(result.current.isAtLimit).toBe(false)
    })

    it('returns correct values when at limit', () => {
        const articles = Array.from(
            { length: NEW_GUIDANCE_ARTICLE_LIMIT },
            () => createMockGuidanceArticle('PUBLIC'),
        )

        const { result } = renderHook(() => useGuidanceLimit(articles))

        expect(result.current.activeGuidanceCount).toBe(
            NEW_GUIDANCE_ARTICLE_LIMIT,
        )
        expect(result.current.isAtLimit).toBe(true)
    })

    it('memoizes result when guidanceArticles reference does not change', () => {
        const articles = Array.from({ length: 50 }, () =>
            createMockGuidanceArticle('PUBLIC'),
        )

        const { result, rerender } = renderHook(
            ({ guidanceArticles }) => useGuidanceLimit(guidanceArticles),
            {
                initialProps: { guidanceArticles: articles },
            },
        )

        const firstResult = result.current

        // Rerender with same reference
        rerender({ guidanceArticles: articles })

        // Should be the same object reference due to useMemo
        expect(result.current).toBe(firstResult)
    })

    it('recalculates when guidanceArticles change', () => {
        const articles1 = Array.from({ length: 50 }, () =>
            createMockGuidanceArticle('PUBLIC'),
        )

        const { result, rerender } = renderHook(
            ({ guidanceArticles }) => useGuidanceLimit(guidanceArticles),
            {
                initialProps: { guidanceArticles: articles1 },
            },
        )

        expect(result.current.activeGuidanceCount).toBe(50)

        // Update with different articles
        const articles2 = Array.from({ length: 75 }, () =>
            createMockGuidanceArticle('PUBLIC'),
        )
        rerender({ guidanceArticles: articles2 })

        expect(result.current.activeGuidanceCount).toBe(75)
    })

    it('only counts PUBLIC articles, not UNLISTED', () => {
        const articles = [
            ...Array.from({ length: 40 }, () =>
                createMockGuidanceArticle('PUBLIC'),
            ),
            ...Array.from({ length: 60 }, () =>
                createMockGuidanceArticle('UNLISTED'),
            ),
        ]

        const { result } = renderHook(() => useGuidanceLimit(articles))

        expect(result.current.activeGuidanceCount).toBe(40)
        expect(result.current.isAtLimit).toBe(false)
    })
})
