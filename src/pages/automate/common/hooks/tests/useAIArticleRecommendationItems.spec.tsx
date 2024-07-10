import {renderHook} from '@testing-library/react-hooks'
import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import {assumeMock} from 'utils/testing'
import {ITEMS_PER_PAGE} from 'pages/stats/convert/constants/campaignPerformanceTable'
import {AIArticlesRecommendationFixture} from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import {
    useAIArticleRecommendationItems,
    AllRecommendationsStatus,
} from '../useAIArticleRecommendationItems'

jest.mock('pages/settings/helpCenter/hooks/useConditionalGetAIArticles')

const mockedUseConditionalGetAIArticles = assumeMock(
    useConditionalGetAIArticles
)

describe('useAIArticleRecommendationItems', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseConditionalGetAIArticles.mockImplementation(
            (): ReturnType<typeof useConditionalGetAIArticles> => {
                return {
                    fetchedArticles: AIArticlesRecommendationFixture,
                    isLoading: false,
                }
            }
        )
    })

    it('should return sorted paginated items', () => {
        const {result} = renderHook(() =>
            useAIArticleRecommendationItems({
                helpCenterId: 1,
                storeIntegrationId: 1,
                locale: 'en-US',
                statusFilter: AllRecommendationsStatus.All,
                currentPage: 1,
                itemsPerPage: ITEMS_PER_PAGE,
            })
        )

        expect(result.current.paginatedItems).toEqual([
            {
                title: 'How to cancel order',
                templateKey: 'ai_Generated_3',
                ticketsCount: 8,
                reviewAction: undefined,
            },
            {
                title: 'AI Generated Article 1',
                templateKey: 'ai_Generated_1',
                ticketsCount: 5,
                reviewAction: 'publish',
            },
            {
                title: 'AI Generated Article 2',
                templateKey: 'ai_Generated_2',
                ticketsCount: 3,
                reviewAction: 'archive',
            },
        ])
        expect(result.current.itemsCount).toBe(3)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return paginated and filtered items', () => {
        const {result} = renderHook(() =>
            useAIArticleRecommendationItems({
                helpCenterId: 1,
                storeIntegrationId: 1,
                locale: 'en-US',
                statusFilter: AllRecommendationsStatus.ArticleCreated,
                currentPage: 1,
                itemsPerPage: ITEMS_PER_PAGE,
            })
        )

        expect(result.current.paginatedItems).toEqual([
            {
                title: 'AI Generated Article 1',
                templateKey: 'ai_Generated_1',
                ticketsCount: 5,
                reviewAction: 'publish',
            },
        ])
        expect(result.current.itemsCount).toBe(1)
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle pagination correctly', () => {
        const {result} = renderHook(() =>
            useAIArticleRecommendationItems({
                helpCenterId: 1,
                storeIntegrationId: 1,
                locale: 'en-US',
                statusFilter: AllRecommendationsStatus.All,
                currentPage: 2,
                itemsPerPage: 2,
            })
        )

        expect(result.current.paginatedItems).toEqual([
            {
                title: 'AI Generated Article 2',
                templateKey: 'ai_Generated_2',
                ticketsCount: 3,
                reviewAction: 'archive',
            },
        ])
        expect(result.current.itemsCount).toBe(3)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when articles are loading', () => {
        mockedUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: null,
            isLoading: true,
        })

        const {result} = renderHook(() =>
            useAIArticleRecommendationItems({
                helpCenterId: 1,
                storeIntegrationId: 1,
                locale: 'en-US',
                statusFilter: AllRecommendationsStatus.All,
                currentPage: 1,
                itemsPerPage: ITEMS_PER_PAGE,
            })
        )

        expect(result.current.paginatedItems).toEqual([])
        expect(result.current.itemsCount).toBe(0)
        expect(result.current.isLoading).toBe(true)
    })
})
