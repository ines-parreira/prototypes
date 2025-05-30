import { QueryObserverResult } from '@tanstack/react-query'

import { useGetMultipleHelpCenterArticleLists } from 'models/helpCenter/queries'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { mapArticleApiToGuidanceArticle } from '../../utils/guidance.utils'
import {
    GUIDANCE_ARTICLES_QUERY_PARAMS,
    useMultipleGuidanceArticles,
} from '../useGuidanceArticles'

// Mock type interfaces to match the expected types
type MockHelpCenterArticle = {
    helpCenterId: number
    id: number
    unlisted_id: string
    created_datetime: string
    updated_datetime: string
    deleted_datetime?: string | null
    category_id: number | null
    help_center_id: number
    ingested_resource_id: string | null
    available_locales: string[]
    rating: number
    title: string
    body: string
    translation: {
        id: number
        title: string
        body: string
        locale: string
    }
}

jest.mock('models/helpCenter/queries', () => ({
    useGetMultipleHelpCenterArticleLists: jest.fn(),
}))

jest.mock('../../utils/guidance.utils', () => ({
    mapArticleApiToGuidanceArticle: jest.fn((article) => ({
        id: article.id,
        title: article.title,
        body: article.body,
        // Add other mapped properties as needed
    })),
}))

const mockedUseGetMultipleHelpCenterArticleLists = assumeMock(
    useGetMultipleHelpCenterArticleLists,
)
const mockedMapArticleApiToGuidanceArticle = assumeMock(
    mapArticleApiToGuidanceArticle,
)

// Create a mock article that matches the expected shape
const createMockArticle = (
    id: number,
    helpCenterId: number,
): MockHelpCenterArticle => ({
    id,
    helpCenterId,
    unlisted_id: `unlisted-${id}`,
    created_datetime: '2023-01-01T00:00:00Z',
    updated_datetime: '2023-01-02T00:00:00Z',
    deleted_datetime: null,
    category_id: null,
    help_center_id: helpCenterId,
    ingested_resource_id: null,
    available_locales: ['en-US'],
    rating: 0,
    title: `Article ${id}`,
    body: `Content ${id}`,
    translation: {
        id: id,
        title: `Article ${id}`,
        body: `Content ${id}`,
        locale: 'en-US',
    },
})

// Create a minimal mock query result that satisfies the UseQueryResult interface
const createMockQueryResult = (
    isFetched: boolean,
): Partial<QueryObserverResult<any, unknown>> => ({
    isFetched,
    isLoading: false,
    isError: false,
    data: null,
    error: null,
    status: 'success',
    refetch: jest.fn(),
})

describe('useMultipleGuidanceArticles', () => {
    const helpCenterIds = [1, 2, 3]
    const mockArticles = [
        createMockArticle(1, 1),
        createMockArticle(2, 2),
        createMockArticle(3, 3),
    ]
    const mockQueries = [
        createMockQueryResult(true),
        createMockQueryResult(false),
        createMockQueryResult(true),
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call useGetMultipleHelpCenterArticleLists with correct parameters', () => {
        mockedUseGetMultipleHelpCenterArticleLists.mockReturnValue({
            articles: [],
            isLoading: false,
            queries: [],
        })

        renderHook(() => useMultipleGuidanceArticles(helpCenterIds))

        expect(useGetMultipleHelpCenterArticleLists).toHaveBeenCalledWith(
            helpCenterIds,
            GUIDANCE_ARTICLES_QUERY_PARAMS,
            {
                refetchOnWindowFocus: false,
            },
        )
    })

    it('should call useGetMultipleHelpCenterArticleLists with overrides', () => {
        mockedUseGetMultipleHelpCenterArticleLists.mockReturnValue({
            articles: [],
            isLoading: false,
            queries: [],
        })

        const overrides = { enabled: false }
        const paramsOverrides = { per_page: 10 }

        renderHook(() =>
            useMultipleGuidanceArticles(
                helpCenterIds,
                overrides,
                paramsOverrides,
            ),
        )

        expect(useGetMultipleHelpCenterArticleLists).toHaveBeenCalledWith(
            helpCenterIds,
            { ...GUIDANCE_ARTICLES_QUERY_PARAMS, ...paramsOverrides },
            {
                ...overrides,
                refetchOnWindowFocus: false,
            },
        )
    })

    it('should map articles correctly', () => {
        mockedUseGetMultipleHelpCenterArticleLists.mockReturnValue({
            articles: mockArticles as any,
            isLoading: false,
            queries: mockQueries as any,
        })

        const { result } = renderHook(() =>
            useMultipleGuidanceArticles(helpCenterIds),
        )

        expect(result.current.guidanceArticles.length).toBe(mockArticles.length)
        expect(result.current.guidanceArticles[0]).toHaveProperty(
            'helpCenterId',
            1,
        )
        expect(result.current.guidanceArticles[1]).toHaveProperty(
            'helpCenterId',
            2,
        )
        expect(result.current.guidanceArticles[2]).toHaveProperty(
            'helpCenterId',
            3,
        )
        expect(mockedMapArticleApiToGuidanceArticle).toHaveBeenCalledTimes(
            mockArticles.length,
        )
    })

    it('should return loading state correctly', () => {
        mockedUseGetMultipleHelpCenterArticleLists.mockReturnValue({
            articles: [],
            isLoading: true,
            queries: [],
        })

        const { result } = renderHook(() =>
            useMultipleGuidanceArticles(helpCenterIds),
        )

        expect(result.current.isGuidanceArticleListLoading).toBe(true)
    })

    it('should calculate isFetched correctly when some queries are fetched', () => {
        mockedUseGetMultipleHelpCenterArticleLists.mockReturnValue({
            articles: mockArticles as any,
            isLoading: false,
            queries: mockQueries as any,
        })

        const { result } = renderHook(() =>
            useMultipleGuidanceArticles(helpCenterIds),
        )

        expect(result.current.isFetched).toBe(true)
    })

    it('should calculate isFetched correctly when no queries are fetched', () => {
        const allFalseQueries = [
            createMockQueryResult(false),
            createMockQueryResult(false),
            createMockQueryResult(false),
        ]

        mockedUseGetMultipleHelpCenterArticleLists.mockReturnValue({
            articles: mockArticles as any,
            isLoading: false,
            queries: allFalseQueries as any,
        })

        const { result } = renderHook(() =>
            useMultipleGuidanceArticles(helpCenterIds),
        )

        expect(result.current.isFetched).toBe(false)
    })

    it('should return empty guidance articles when no articles are returned', () => {
        mockedUseGetMultipleHelpCenterArticleLists.mockReturnValue({
            articles: [],
            isLoading: false,
            queries: [],
        })

        const { result } = renderHook(() =>
            useMultipleGuidanceArticles(helpCenterIds),
        )

        expect(result.current.guidanceArticles).toEqual([])
    })

    it('should preserve helpCenterId in the mapped articles', () => {
        const articlesWithHelpCenterIds = [
            createMockArticle(1, 1),
            createMockArticle(2, 2),
        ]

        mockedUseGetMultipleHelpCenterArticleLists.mockReturnValue({
            articles: articlesWithHelpCenterIds as any,
            isLoading: false,
            queries: [
                createMockQueryResult(true),
                createMockQueryResult(true),
            ] as any,
        })

        const { result } = renderHook(() => useMultipleGuidanceArticles([1, 2]))

        expect(result.current.guidanceArticles[0].helpCenterId).toBe(1)
        expect(result.current.guidanceArticles[1].helpCenterId).toBe(2)
    })
})
