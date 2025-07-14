import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { ITEMS_PER_PAGE } from 'domains/reporting/pages/convert/constants/campaignPerformanceTable'
import { AIArticlesRecommendationFixture } from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import { ArticleOrigin } from 'pages/settings/helpCenter/types/articleOrigin.enum'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTopQuestionsArticles } from '../../components/TopQuestions/useTopQuestionsArticles'
import {
    AllRecommendationsStatus,
    isAllRecommendationStatus,
    useAIArticleRecommendationItems,
} from '../useAIArticleRecommendationItems'

const queryClient = mockQueryClient()

jest.mock('../../components/TopQuestions/useTopQuestionsArticles')
const mockedUseTopQuestionsArticles = assumeMock(useTopQuestionsArticles)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

describe('useAIArticleRecommendationItems', () => {
    const mockedCreateArticle = jest.fn()
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseTopQuestionsArticles.mockImplementation(
            (): ReturnType<typeof useTopQuestionsArticles> => {
                return {
                    articles: AIArticlesRecommendationFixture,
                    isLoading: false,
                    createArticle: mockedCreateArticle,
                    dismissArticle: jest.fn(),
                }
            },
        )
    })

    it('should return sorted paginated items', () => {
        const { result } = renderHook(
            () =>
                useAIArticleRecommendationItems({
                    helpCenterId: 1,
                    storeIntegrationId: 1,
                    locale: 'en-US',
                    statusFilter: AllRecommendationsStatus.All,
                    currentPage: 1,
                    itemsPerPage: ITEMS_PER_PAGE,
                    origin: ArticleOrigin.ALL_RECOMMENDATIONS_PAGE,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.paginatedItems).toEqual([
            {
                title: 'How to cancel order',
                templateKey: 'ai_Generated_3',
                ticketsCount: 8,
                createArticle: expect.any(Function),
                reviewAction: undefined,
            },
            {
                title: 'AI Generated Article 1',
                templateKey: 'ai_Generated_1',
                ticketsCount: 5,
                createArticle: expect.any(Function),
                reviewAction: 'publish',
            },
            {
                title: 'AI Generated Article 2',
                templateKey: 'ai_Generated_2',
                ticketsCount: 3,
                createArticle: expect.any(Function),
                reviewAction: 'archive',
            },
        ])
        expect(result.current.itemsCount).toBe(3)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return paginated and filtered items', () => {
        const { result } = renderHook(
            () =>
                useAIArticleRecommendationItems({
                    helpCenterId: 1,
                    storeIntegrationId: 1,
                    locale: 'en-US',
                    statusFilter: AllRecommendationsStatus.ArticleCreated,
                    currentPage: 1,
                    itemsPerPage: ITEMS_PER_PAGE,
                    origin: ArticleOrigin.ALL_RECOMMENDATIONS_PAGE,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.paginatedItems).toEqual([
            {
                title: 'AI Generated Article 1',
                templateKey: 'ai_Generated_1',
                ticketsCount: 5,
                createArticle: expect.any(Function),
                reviewAction: 'publish',
            },
        ])
        expect(result.current.itemsCount).toBe(1)
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle pagination correctly', () => {
        const { result } = renderHook(
            () =>
                useAIArticleRecommendationItems({
                    helpCenterId: 1,
                    storeIntegrationId: 1,
                    locale: 'en-US',
                    statusFilter: AllRecommendationsStatus.All,
                    currentPage: 2,
                    itemsPerPage: 2,
                    origin: ArticleOrigin.ALL_RECOMMENDATIONS_PAGE,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.paginatedItems).toEqual([
            {
                title: 'AI Generated Article 2',
                templateKey: 'ai_Generated_2',
                ticketsCount: 3,
                createArticle: expect.any(Function),
                reviewAction: 'archive',
            },
        ])
        expect(result.current.itemsCount).toBe(3)
        expect(result.current.isLoading).toBe(false)
    })

    it('should call createArticle with correct arguments', async () => {
        const { result } = renderHook(
            () =>
                useAIArticleRecommendationItems({
                    helpCenterId: 1,
                    storeIntegrationId: 1,
                    locale: 'en-US',
                    statusFilter: AllRecommendationsStatus.All,
                    currentPage: 1,
                    itemsPerPage: ITEMS_PER_PAGE,
                    origin: ArticleOrigin.ALL_RECOMMENDATIONS_PAGE,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        await result.current.paginatedItems[0].createArticle()

        expect(mockedCreateArticle).toHaveBeenCalledWith(
            'ai_Generated_3',
            ArticleOrigin.ALL_RECOMMENDATIONS_PAGE,
        )
    })

    it('should return isLoading as true when articles are loading', () => {
        mockedUseTopQuestionsArticles.mockReturnValue({
            articles: [],
            isLoading: true,
            createArticle: jest.fn(),
            dismissArticle: jest.fn(),
        })

        const { result } = renderHook(
            () =>
                useAIArticleRecommendationItems({
                    helpCenterId: 1,
                    storeIntegrationId: 1,
                    locale: 'en-US',
                    statusFilter: AllRecommendationsStatus.All,
                    currentPage: 1,
                    itemsPerPage: ITEMS_PER_PAGE,
                    origin: ArticleOrigin.ALL_RECOMMENDATIONS_PAGE,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.paginatedItems).toEqual([])
        expect(result.current.itemsCount).toBe(0)
        expect(result.current.isLoading).toBe(true)
    })
})

describe('isAllRecommendationStatus', () => {
    it.each([
        [AllRecommendationsStatus.All, true],
        [AllRecommendationsStatus.ArticleCreated, true],
        [AllRecommendationsStatus.NotCreated, true],
        ['invalid', false],
        [undefined, false],
    ])('for %s it returns %s', (status, expected) => {
        expect(isAllRecommendationStatus(status)).toBe(expected)
    })
})
