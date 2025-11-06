import { assumeMock, renderHook } from '@repo/testing'

import { useFlag } from 'core/flags'
import { useKnowledgeServiceOpportunities } from 'pages/aiAgent/opportunities/hooks/useKnowledgeServiceOpportunities'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'

import { useOpportunitiesCount } from '../useOpportunitiesCount'

jest.mock(
    'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary',
)

jest.mock('pages/aiAgent/opportunities/hooks/useKnowledgeServiceOpportunities')

jest.mock('pages/aiAgent/hooks/useShopIntegrationId', () => ({
    useShopIntegrationId: jest.fn(() => undefined),
}))

jest.mock('core/flags')

const mockUseHelpCenterAIArticlesLibrary = assumeMock(
    useHelpCenterAIArticlesLibrary,
)

const mockUseKnowledgeServiceOpportunities = assumeMock(
    useKnowledgeServiceOpportunities,
)

const mockUseFlag = assumeMock(useFlag)

describe('useOpportunitiesCount', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockReturnValue(false)

        mockUseKnowledgeServiceOpportunities.mockReturnValue({
            opportunities: [],
            isLoading: false,
            totalCount: 0,
            totalPending: 0,
            isFetchingNextPage: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            preloadNextPage: jest.fn(),
            refetch: jest.fn(),
        })
    })

    it('should return count of 0 when there are no articles', () => {
        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: [],
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result } = renderHook(() =>
            useOpportunitiesCount(1, 'en-US', 'test-shop'),
        )

        expect(result.current.count).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return count of 0 when articles is null', () => {
        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: null as any,
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result } = renderHook(() =>
            useOpportunitiesCount(1, 'en-US', 'test-shop'),
        )

        expect(result.current.count).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return correct count when there are articles', () => {
        const mockArticles = [
            {
                id: '1',
                title: 'Article 1',
                content: 'Content 1',
                article_key: 'key1',
                article_template_key: 'template1',
            },
            {
                id: '2',
                title: 'Article 2',
                content: 'Content 2',
                article_key: 'key2',
                article_template_key: 'template2',
            },
        ]

        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: mockArticles as any,
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result } = renderHook(() =>
            useOpportunitiesCount(1, 'en-US', 'test-shop'),
        )

        expect(result.current.count).toBe(2)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading true when data is loading', () => {
        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: [],
            isLoading: true,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result } = renderHook(() =>
            useOpportunitiesCount(1, 'en-US', 'test-shop'),
        )

        expect(result.current.count).toBe(0)
        expect(result.current.isLoading).toBe(true)
    })

    it('should handle undefined shopName correctly', () => {
        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: [],
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result } = renderHook(() =>
            useOpportunitiesCount(1, 'en-US', undefined),
        )

        expect(result.current.count).toBe(0)
        expect(result.current.isLoading).toBe(false)
        expect(mockUseHelpCenterAIArticlesLibrary).toHaveBeenCalledWith(
            1,
            'en-US',
            null,
            true,
        )
    })

    it('should recalculate count when articles change', () => {
        const initialArticles = [
            {
                id: '1',
                title: 'Article 1',
                content: 'Content 1',
                article_key: 'key1',
                article_template_key: 'template1',
            },
        ]

        const updatedArticles = [
            {
                id: '1',
                title: 'Article 1',
                content: 'Content 1',
                article_key: 'key1',
                article_template_key: 'template1',
            },
            {
                id: '2',
                title: 'Article 2',
                content: 'Content 2',
                article_key: 'key2',
                article_template_key: 'template2',
            },
            {
                id: '3',
                title: 'Article 3',
                content: 'Content 3',
                article_key: 'key3',
                article_template_key: 'template3',
            },
        ]

        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: initialArticles as any,
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result, rerender } = renderHook(() =>
            useOpportunitiesCount(1, 'en-US', 'test-shop'),
        )

        expect(result.current.count).toBe(1)

        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: updatedArticles as any,
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        rerender()

        expect(result.current.count).toBe(3)
    })

    it('should pass correct parameters to useHelpCenterAIArticlesLibrary', () => {
        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: [],
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const helpCenterId = 123
        const locale = 'fr-FR' as const
        const shopName = 'my-shop'

        renderHook(() => useOpportunitiesCount(helpCenterId, locale, shopName))

        expect(mockUseHelpCenterAIArticlesLibrary).toHaveBeenCalledWith(
            helpCenterId,
            locale,
            shopName,
            true,
        )
    })

    it('should memoize the count calculation', () => {
        const mockArticles = [
            {
                id: '1',
                title: 'Article 1',
                content: 'Content 1',
                article_key: 'key1',
                article_template_key: 'template1',
            },
        ]

        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: mockArticles as any,
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result, rerender } = renderHook(() =>
            useOpportunitiesCount(1, 'en-US', 'test-shop'),
        )

        const initialCount = result.current.count

        rerender()

        expect(result.current.count).toBe(initialCount)
        expect(result.current.count).toBe(1)
    })

    it('should handle single article correctly', () => {
        const mockArticles = [
            {
                id: '1',
                title: 'Article 1',
                content: 'Content 1',
                article_key: 'key1',
                article_template_key: 'template1',
            },
        ]

        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: mockArticles as any,
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result } = renderHook(() =>
            useOpportunitiesCount(1, 'en-US', 'test-shop'),
        )

        expect(result.current.count).toBe(1)
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle loading state transitions correctly', () => {
        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: [],
            isLoading: true,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result, rerender } = renderHook(() =>
            useOpportunitiesCount(1, 'en-US', 'test-shop'),
        )

        expect(result.current.isLoading).toBe(true)

        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: [
                {
                    id: '1',
                    title: 'Article 1',
                    content: 'Content 1',
                    article_key: 'key1',
                    article_template_key: 'template1',
                },
            ] as any,
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        rerender()

        expect(result.current.isLoading).toBe(false)
        expect(result.current.count).toBe(1)
    })

    describe('useKnowledgeService feature flag enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should return totalCount from knowledge service when feature flag is enabled', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: [],
                isLoading: false,
                totalCount: 5,
                totalPending: 5,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: jest.fn(),
                preloadNextPage: jest.fn(),
                refetch: jest.fn(),
            })

            mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
                articles: [],
                isLoading: false,
                markArticleAsReviewed: jest.fn(),
            } as any)

            const { result } = renderHook(() =>
                useOpportunitiesCount(1, 'en-US', 'test-shop'),
            )

            expect(result.current.count).toBe(5)
            expect(result.current.isLoading).toBe(false)
        })

        it('should return loading state from knowledge service when feature flag is enabled', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: [],
                isLoading: true,
                totalCount: 0,
                totalPending: 0,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: jest.fn(),
                preloadNextPage: jest.fn(),
                refetch: jest.fn(),
            })

            mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
                articles: [],
                isLoading: false,
                markArticleAsReviewed: jest.fn(),
            } as any)

            const { result } = renderHook(() =>
                useOpportunitiesCount(1, 'en-US', 'test-shop'),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should handle undefined totalCount from knowledge service', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: [],
                isLoading: false,
                totalCount: undefined as any,
                totalPending: undefined as any,
                isFetchingNextPage: false,
                hasNextPage: false,
                fetchNextPage: jest.fn(),
                preloadNextPage: jest.fn(),
                refetch: jest.fn(),
            })

            mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
                articles: [],
                isLoading: false,
                markArticleAsReviewed: jest.fn(),
            } as any)

            const { result } = renderHook(() =>
                useOpportunitiesCount(1, 'en-US', 'test-shop'),
            )

            expect(result.current.count).toBeUndefined()
        })
    })

    it('should return 0 when helpCenterId is 0', () => {
        mockUseHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: [
                {
                    id: '1',
                    title: 'Article 1',
                    content: 'Content 1',
                    article_key: 'key1',
                    article_template_key: 'template1',
                },
            ] as any,
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        } as any)

        const { result } = renderHook(() =>
            useOpportunitiesCount(0, 'en-US', 'test-shop'),
        )

        expect(result.current.count).toBe(0)
    })
})
