import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {
    getHelpCentersResponseFixture,
    getSingleHelpCenterResponseFixture,
} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { HelpCenterClient } from 'rest_api/help_center_api/client'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { HELP_CENTER_ROOT_CATEGORY_ID } from '../../../pages/settings/helpCenter/constants'
import {
    fetchAllPagesForHelpCenter,
    useCreateFileIngestion,
    useDeleteFileIngestion,
    useGetArticleIngestionArticlesTitleAndStatus,
    useGetArticleIngestionLogs,
    useGetArticleIngestionLogsList,
    useGetArticleTranslations,
    useGetFileIngestion,
    useGetFileIngestionArticleTitlesAndStatus,
    useGetHelpCenter,
    useGetHelpCenterArticle,
    useGetHelpCenterArticleList,
    useGetHelpCenterCategoryTree,
    useGetHelpCenterList,
    useGetHelpCenterListMulti,
    useGetIngestedResource,
    useGetIngestionLogs,
    useGetIngestionLogsList,
    useGetKnowledgeStatus,
    useGetMultipleFileIngestionSnippets,
    useGetMultipleHelpCenter,
    useGetMultipleHelpCenterArticleLists,
    useListIngestedResources,
    useListIntents,
    useStartIngestion,
    useUpdateAllIngestedResourcesStatus,
    useUpdateIngestedResource,
} from '../queries'
import * as resources from '../resources'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

const getHelpCenterArticles = jest.spyOn(resources, 'getHelpCenterArticles')
const getHelpCenterArticle = jest.spyOn(resources, 'getHelpCenterArticle')
const getHelpCenter = jest.spyOn(resources, 'getHelpCenter')
const getCategoryTree = jest.spyOn(resources, 'getCategoryTree')
const getHelpCenterList = jest.spyOn(resources, 'getHelpCenterList')
const getArticleIngestionLogs = jest.spyOn(resources, 'getArticleIngestionLogs')
const getIngestionLogs = jest.spyOn(resources, 'getIngestionLogs')
const startIngestion = jest.spyOn(resources, 'startIngestion')
const listIngestedResources = jest.spyOn(resources, 'listIngestedResources')
const getIngestedResource = jest.spyOn(resources, 'getIngestedResource')
const updateIngestedResource = jest.spyOn(resources, 'updateIngestedResource')
const updateAllIngestedResourcesStatus = jest.spyOn(
    resources,
    'updateAllIngestedResourcesStatus',
)
const createFileIngestion = jest.spyOn(resources, 'createFileIngestion')
const getFileIngestion = jest.spyOn(resources, 'getFileIngestion')
const deleteFileIngestion = jest.spyOn(resources, 'deleteFileIngestion')
const getArticleIngestionArticleTitlesAndStatus = jest.spyOn(
    resources,
    'getArticleIngestionArticleTitlesAndStatus',
)
const getFileIngestionArticleTitlesAndStatus = jest.spyOn(
    resources,
    'getFileIngestionArticleTitlesAndStatus',
)
const getKnowledgeStatus = jest.spyOn(resources, 'getKnowledgeStatus')
const listIntents = jest.spyOn(resources, 'listIntents')

const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const helpCenterId = 1
const mockUseHelpCenterApi = jest.mocked(useHelpCenterApi)

// Define article mock data that matches the expected structure at the top level
const mockArticles = [
    {
        id: 1,
        unlisted_id: 'unlisted1',
        created_datetime: '2023-01-01T00:00:00Z',
        updated_datetime: '2023-01-02T00:00:00Z',
        ingested_resource_id: 1,
        category_id: 100,
        help_center_id: 1,
        available_locales: ['en-US'],
        translation: {
            created_datetime: '2023-01-01T00:00:00Z',
            updated_datetime: '2023-01-02T00:00:00Z',
            title: 'Article 1',
            excerpt: 'Excerpt 1',
            content: 'Content 1',
            slug: 'article-1',
            locale: 'en-US',
            article_id: 1,
            category_id: 100,
            article_unlisted_id: 'unlisted1',
            seo_meta: { title: null, description: null },
            visibility_status: 'PUBLIC',
            is_current: true,
            rating: { up: 0, down: 0 },
        },
        rating: { up: 0, down: 0 },
    },
    {
        id: 2,
        unlisted_id: 'unlisted2',
        created_datetime: '2023-01-01T00:00:00Z',
        updated_datetime: '2023-01-02T00:00:00Z',
        ingested_resource_id: 1,
        category_id: 100,
        slug: 'article-2',
        help_center_id: 2,
        available_locales: ['en-US'],
        translation: {
            created_datetime: '2023-01-01T00:00:00Z',
            updated_datetime: '2023-01-02T00:00:00Z',
            title: 'Article 2',
            excerpt: 'Excerpt 2',
            content: 'Content 2',
            slug: 'article-2',
            locale: 'en-US',
            article_id: 2,
            category_id: 100,
            article_unlisted_id: 'unlisted2',
            seo_meta: { title: null, description: null },
            visibility_status: 'PUBLIC',
            is_current: true,
            rating: { up: 0, down: 0 },
        },
        rating: { up: 0, down: 0 },
    },
    {
        id: 3,
        unlisted_id: 'unlisted3',
        created_datetime: '2023-01-01T00:00:00Z',
        updated_datetime: '2023-01-02T00:00:00Z',
        ingested_resource_id: 1,
        category_id: 100,
        slug: 'article-3',
        help_center_id: 3,
        available_locales: ['en-US'],
        translation: {
            created_datetime: '2023-01-01T00:00:00Z',
            updated_datetime: '2023-01-02T00:00:00Z',
            title: 'Article 3',
            excerpt: 'Excerpt 3',
            content: 'Content 3',
            slug: 'article-3',
            locale: 'en-US',
            article_id: 3,
            category_id: 100,
            article_unlisted_id: 'unlisted3',
            seo_meta: { title: null, description: null },
            visibility_status: 'PUBLIC',
            is_current: true,
            rating: { up: 0, down: 0 },
        },
        rating: { up: 0, down: 0 },
    },
] as Components.Schemas.ArticleListDataDto[]

describe('queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('useGetHelpCenterArticleList', () => {
        it('should return correct data on success', async () => {
            getHelpCenterArticles.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () => useGetHelpCenterArticleList(helpCenterId, {}),
                {
                    wrapper,
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(null)
        })

        it('should not call the api function when enabled false', () => {
            getHelpCenterArticles.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useGetHelpCenterArticleList(
                        helpCenterId,
                        {},
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(0)
        })

        it('should not call the api function when client is not set', () => {
            getHelpCenterArticles.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(
                () =>
                    useGetHelpCenterArticleList(
                        helpCenterId,
                        {},
                        { enabled: true },
                    ),
                {
                    wrapper,
                },
            )

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetMultipleHelpCenterArticleLists', () => {
        const helpCenterIds = [1, 2, 3]
        const queryParams = { locale: 'en-US' as const }

        // Define article mock data that matches the expected structure
        const mockArticles = [
            {
                id: 1,
                unlisted_id: 'unlisted1',
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-01-02T00:00:00Z',
                ingested_resource_id: 1,
                category_id: 100,
                help_center_id: 1,
                available_locales: ['en-US'],
                translation: {
                    created_datetime: '2023-01-01T00:00:00Z',
                    updated_datetime: '2023-01-02T00:00:00Z',
                    title: 'Article 1',
                    excerpt: 'Excerpt 1',
                    content: 'Content 1',
                    slug: 'article-1',
                    locale: 'en-US',
                    article_id: 1,
                    category_id: 100,
                    article_unlisted_id: 'unlisted1',
                    seo_meta: { title: null, description: null },
                    visibility_status: 'PUBLIC',
                    is_current: true,
                    rating: { up: 0, down: 0 },
                },
                rating: { up: 0, down: 0 },
            },
            {
                id: 2,
                unlisted_id: 'unlisted2',
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-01-02T00:00:00Z',
                ingested_resource_id: 1,
                category_id: 100,
                slug: 'article-2',
                help_center_id: 2,
                available_locales: ['en-US'],
                translation: {
                    created_datetime: '2023-01-01T00:00:00Z',
                    updated_datetime: '2023-01-02T00:00:00Z',
                    title: 'Article 2',
                    excerpt: 'Excerpt 2',
                    content: 'Content 2',
                    slug: 'article-2',
                    locale: 'en-US',
                    article_id: 2,
                    category_id: 100,
                    article_unlisted_id: 'unlisted2',
                    seo_meta: { title: null, description: null },
                    visibility_status: 'PUBLIC',
                    is_current: true,
                    rating: { up: 0, down: 0 },
                },
                rating: { up: 0, down: 0 },
            },
            {
                id: 3,
                unlisted_id: 'unlisted3',
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-01-02T00:00:00Z',
                ingested_resource_id: 1,
                category_id: 100,
                slug: 'article-3',
                help_center_id: 3,
                available_locales: ['en-US'],
                translation: {
                    created_datetime: '2023-01-01T00:00:00Z',
                    updated_datetime: '2023-01-02T00:00:00Z',
                    title: 'Article 3',
                    excerpt: 'Excerpt 3',
                    content: 'Content 3',
                    slug: 'article-3',
                    locale: 'en-US',
                    article_id: 3,
                    category_id: 100,
                    article_unlisted_id: 'unlisted3',
                    seo_meta: { title: null, description: null },
                    visibility_status: 'PUBLIC',
                    is_current: true,
                    rating: { up: 0, down: 0 },
                },
                rating: { up: 0, down: 0 },
            },
        ] as Components.Schemas.ArticleListDataDto[]

        beforeEach(() => {
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
        })

        it('should fetch articles from multiple help centers and add helpCenterId to each article', async () => {
            getHelpCenterArticles
                .mockResolvedValueOnce({
                    data: [mockArticles[0]],
                    meta: {
                        page: 1,
                        per_page: 10,
                        current_page: '1',
                        item_count: 1,
                        nb_pages: 1,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce({
                    data: [mockArticles[1]],
                    meta: {
                        page: 1,
                        per_page: 10,
                        current_page: '1',
                        item_count: 1,
                        nb_pages: 1,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce({
                    data: [mockArticles[2]],
                    meta: {
                        page: 1,
                        per_page: 10,
                        current_page: '1',
                        item_count: 1,
                        nb_pages: 1,
                    },
                    object: 'list',
                })

            const { result } = renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        helpCenterIds,
                        queryParams,
                    ),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.articles).toHaveLength(3)
            expect(result.current.articles[0]).toEqual({
                ...mockArticles[0],
                helpCenterId: helpCenterIds[0],
            })
            expect(result.current.articles[1]).toEqual({
                ...mockArticles[1],
                helpCenterId: helpCenterIds[1],
            })
            expect(result.current.articles[2]).toEqual({
                ...mockArticles[2],
                helpCenterId: helpCenterIds[2],
            })

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(3)
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                1,
                expect.anything(),
                { help_center_id: helpCenterIds[0] },
                { ...queryParams, page: 1 },
            )
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                2,
                expect.anything(),
                { help_center_id: helpCenterIds[1] },
                { ...queryParams, page: 1 },
            )
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                3,
                expect.anything(),
                { help_center_id: helpCenterIds[2] },
                { ...queryParams, page: 1 },
            )
        })

        it('should handle empty responses gracefully', async () => {
            getHelpCenterArticles
                .mockResolvedValueOnce({
                    data: [],
                    meta: {
                        page: 1,
                        per_page: 10,
                        current_page: '1',
                        item_count: 0,
                        nb_pages: 1,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({
                    data: [mockArticles[2]],
                    meta: {
                        page: 1,
                        per_page: 10,
                        current_page: '1',
                        item_count: 1,
                        nb_pages: 1,
                    },
                    object: 'list',
                })

            const { result } = renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        helpCenterIds,
                        queryParams,
                    ),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.articles).toHaveLength(1)
            expect(result.current.articles[0]).toEqual({
                ...mockArticles[2],
                helpCenterId: helpCenterIds[2],
            })
        })

        it('should not call the api function when client is not set', () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })

            renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        helpCenterIds,
                        queryParams,
                    ),
                { wrapper },
            )

            expect(getHelpCenterArticles).not.toHaveBeenCalled()
        })

        it('should not call the api function for invalid helpCenterIds', async () => {
            getHelpCenterArticles.mockResolvedValue({
                data: [],
                meta: {
                    page: 1,
                    per_page: 10,
                    current_page: '1',
                    item_count: 0,
                    nb_pages: 1,
                },
                object: 'list',
            })

            renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        [0, undefined as unknown as number, 3],
                        queryParams,
                    ),
                { wrapper },
            )

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(1)
            expect(getHelpCenterArticles).toHaveBeenCalledWith(
                expect.anything(),
                { help_center_id: 3 },
                { ...queryParams, page: 1 },
            )
        })

        it('should not be loading when queries are disabled via overrides', async () => {
            getHelpCenterArticles.mockResolvedValue({
                data: [mockArticles[0]],
                meta: {
                    page: 1,
                    per_page: 10,
                    current_page: '1',
                    item_count: 1,
                    nb_pages: 1,
                },
                object: 'list',
            })

            const { result } = renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        helpCenterIds,
                        queryParams,
                        { enabled: false },
                    ),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(false)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(getHelpCenterArticles).not.toHaveBeenCalled()
            expect(result.current.articles).toEqual([])
        })

        it('should not be loading when helpCenterIds is empty', async () => {
            getHelpCenterArticles.mockResolvedValue({
                data: [],
                meta: {
                    page: 1,
                    per_page: 10,
                    current_page: '1',
                    item_count: 0,
                    nb_pages: 1,
                },
                object: 'list',
            })

            const { result } = renderHook(
                () => useGetMultipleHelpCenterArticleLists([], queryParams),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(false)
            expect(getHelpCenterArticles).not.toHaveBeenCalled()
            expect(result.current.articles).toEqual([])
        })

        it('should handle multi-page results correctly', async () => {
            const page1Articles = [
                {
                    ...mockArticles[0],
                    id: 1,
                    translation: {
                        ...mockArticles[0].translation,
                        title: 'Page 1 Article 1',
                    },
                },
                {
                    ...mockArticles[0],
                    id: 2,
                    translation: {
                        ...mockArticles[0].translation,
                        title: 'Page 1 Article 2',
                    },
                },
            ]
            const page2Articles = [
                {
                    ...mockArticles[0],
                    id: 3,
                    translation: {
                        ...mockArticles[0].translation,
                        title: 'Page 2 Article 1',
                    },
                },
                {
                    ...mockArticles[0],
                    id: 4,
                    translation: {
                        ...mockArticles[0].translation,
                        title: 'Page 2 Article 2',
                    },
                },
            ]
            const page3Articles = [
                {
                    ...mockArticles[0],
                    id: 5,
                    translation: {
                        ...mockArticles[0].translation,
                        title: 'Page 3 Article 1',
                    },
                },
            ]

            getHelpCenterArticles
                .mockResolvedValueOnce({
                    data: page1Articles,
                    meta: {
                        page: 1,
                        per_page: 2,
                        current_page: '1',
                        item_count: 5,
                        nb_pages: 3,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce({
                    data: page2Articles,
                    meta: {
                        page: 2,
                        per_page: 2,
                        current_page: '2',
                        item_count: 5,
                        nb_pages: 3,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce({
                    data: page3Articles,
                    meta: {
                        page: 3,
                        per_page: 2,
                        current_page: '3',
                        item_count: 5,
                        nb_pages: 3,
                    },
                    object: 'list',
                })

            const { result } = renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        [helpCenterIds[0]],
                        queryParams,
                    ),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.articles).toHaveLength(5)
            expect(
                result.current.articles.map((a) => a.translation.title),
            ).toEqual([
                'Page 1 Article 1',
                'Page 1 Article 2',
                'Page 2 Article 1',
                'Page 2 Article 2',
                'Page 3 Article 1',
            ])

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(3)
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                1,
                expect.anything(),
                { help_center_id: helpCenterIds[0] },
                { ...queryParams, page: 1 },
            )
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                2,
                expect.anything(),
                { help_center_id: helpCenterIds[0] },
                { ...queryParams, page: 2 },
            )
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                3,
                expect.anything(),
                { help_center_id: helpCenterIds[0] },
                { ...queryParams, page: 3 },
            )
        })

        it('should handle multiple help centers with multi-page results', async () => {
            const hc1Page1 = [
                {
                    ...mockArticles[0],
                    id: 1,
                    translation: {
                        ...mockArticles[0].translation,
                        title: 'HC1 P1 A1',
                    },
                },
            ]
            const hc1Page2 = [
                {
                    ...mockArticles[0],
                    id: 2,
                    translation: {
                        ...mockArticles[0].translation,
                        title: 'HC1 P2 A1',
                    },
                },
            ]
            const hc2Page1 = [
                {
                    ...mockArticles[1],
                    id: 3,
                    translation: {
                        ...mockArticles[1].translation,
                        title: 'HC2 P1 A1',
                    },
                },
            ]
            const hc2Page2 = [
                {
                    ...mockArticles[1],
                    id: 4,
                    translation: {
                        ...mockArticles[1].translation,
                        title: 'HC2 P2 A1',
                    },
                },
            ]

            getHelpCenterArticles
                .mockResolvedValueOnce({
                    data: hc1Page1,
                    meta: {
                        page: 1,
                        per_page: 1,
                        current_page: '1',
                        item_count: 2,
                        nb_pages: 2,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce({
                    data: hc2Page1,
                    meta: {
                        page: 1,
                        per_page: 1,
                        current_page: '1',
                        item_count: 2,
                        nb_pages: 2,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce({
                    data: hc1Page2,
                    meta: {
                        page: 2,
                        per_page: 1,
                        current_page: '2',
                        item_count: 2,
                        nb_pages: 2,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce({
                    data: hc2Page2,
                    meta: {
                        page: 2,
                        per_page: 1,
                        current_page: '2',
                        item_count: 2,
                        nb_pages: 2,
                    },
                    object: 'list',
                })

            const { result } = renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        [helpCenterIds[0], helpCenterIds[1]],
                        queryParams,
                    ),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.articles).toHaveLength(4)
            expect(
                result.current.articles.map((a) => ({
                    title: a.translation.title,
                    hcId: a.helpCenterId,
                })),
            ).toEqual([
                { title: 'HC1 P1 A1', hcId: helpCenterIds[0] },
                { title: 'HC2 P1 A1', hcId: helpCenterIds[1] },
                { title: 'HC1 P2 A1', hcId: helpCenterIds[0] },
                { title: 'HC2 P2 A1', hcId: helpCenterIds[1] },
            ])

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(4)
        })

        it('should handle null additional page query data', async () => {
            getHelpCenterArticles
                .mockResolvedValueOnce({
                    data: [
                        {
                            ...mockArticles[0],
                            translation: {
                                ...mockArticles[0].translation,
                                title: 'Page 1 Article',
                            },
                        },
                    ],
                    meta: {
                        page: 1,
                        per_page: 1,
                        current_page: '1',
                        item_count: 2,
                        nb_pages: 2,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce(null)

            const { result } = renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        [helpCenterIds[0]],
                        queryParams,
                    ),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.articles).toHaveLength(1)
            expect(result.current.articles[0].translation.title).toBe(
                'Page 1 Article',
            )
        })

        it('should handle empty additional page data', async () => {
            getHelpCenterArticles
                .mockResolvedValueOnce({
                    data: [
                        {
                            ...mockArticles[0],
                            translation: {
                                ...mockArticles[0].translation,
                                title: 'Page 1 Article',
                            },
                        },
                    ],
                    meta: {
                        page: 1,
                        per_page: 1,
                        current_page: '1',
                        item_count: 1,
                        nb_pages: 2,
                    },
                    object: 'list',
                })
                .mockResolvedValueOnce({
                    data: [],
                    meta: {
                        page: 2,
                        per_page: 1,
                        current_page: '2',
                        item_count: 1,
                        nb_pages: 2,
                    },
                    object: 'list',
                })

            const { result } = renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        [helpCenterIds[0]],
                        queryParams,
                    ),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.articles).toHaveLength(1)
            expect(result.current.articles[0].translation.title).toBe(
                'Page 1 Article',
            )
        })

        it('should handle first page failure gracefully', async () => {
            getHelpCenterArticles.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        [helpCenterIds[0]],
                        queryParams,
                    ),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.articles).toEqual([])
        })

        it('should handle mixed successful and failed help center queries', async () => {
            getHelpCenterArticles
                .mockResolvedValueOnce({
                    data: [
                        {
                            ...mockArticles[0],
                            translation: {
                                ...mockArticles[0].translation,
                                title: 'Success Article',
                            },
                        },
                    ],
                    meta: {
                        page: 1,
                        per_page: 1,
                        current_page: '1',
                        item_count: 1,
                        nb_pages: 1,
                    },
                    object: 'list',
                })
                .mockRejectedValueOnce(new Error('HC2 Failed'))
                .mockResolvedValueOnce({
                    data: [
                        {
                            ...mockArticles[2],
                            translation: {
                                ...mockArticles[2].translation,
                                title: 'Another Success',
                            },
                        },
                    ],
                    meta: {
                        page: 1,
                        per_page: 1,
                        current_page: '1',
                        item_count: 1,
                        nb_pages: 1,
                    },
                    object: 'list',
                })

            const { result } = renderHook(
                () =>
                    useGetMultipleHelpCenterArticleLists(
                        helpCenterIds,
                        queryParams,
                    ),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.articles).toHaveLength(2)
            expect(result.current.articles[0].translation.title).toBe(
                'Success Article',
            )
            expect(result.current.articles[1].translation.title).toBe(
                'Another Success',
            )
        })
    })

    describe('useGetHelpCenterCategoryTree', () => {
        it('should return correct data on success', async () => {
            getCategoryTree.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () =>
                    useGetHelpCenterCategoryTree(
                        helpCenterId,
                        HELP_CENTER_ROOT_CATEGORY_ID,
                        {
                            locale: 'en-US',
                        },
                    ),
                {
                    wrapper,
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(null)
        })

        it('should not call the api function when enabled false', () => {
            getCategoryTree.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useGetHelpCenterCategoryTree(
                        helpCenterId,
                        HELP_CENTER_ROOT_CATEGORY_ID,
                        {
                            locale: 'en-US',
                        },
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )

            expect(getCategoryTree).toHaveBeenCalledTimes(0)
        })

        it('should not call the api function when client is not set', () => {
            getCategoryTree.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(
                () =>
                    useGetHelpCenterCategoryTree(
                        helpCenterId,
                        HELP_CENTER_ROOT_CATEGORY_ID,
                        {
                            locale: 'en-US',
                        },
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )

            expect(getCategoryTree).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetHelpCenterArticle ', () => {
        it('should return correct data on success', async () => {
            getHelpCenterArticle.mockReturnValue(
                Promise.resolve(getSingleArticleEnglish),
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const articleId = 1
            const locale = 'en-US'
            const { result } = renderHook(
                () => useGetHelpCenterArticle(articleId, helpCenterId, locale),
                {
                    wrapper,
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(getSingleArticleEnglish)
        })
        it('should return undefined if arguments not provided', async () => {
            getHelpCenterArticle.mockReturnValue(
                Promise.resolve(getSingleArticleEnglish),
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const articleId = 1
            const locale = 'en-US'
            const { result } = renderHook(
                () => useGetHelpCenterArticle(articleId, helpCenterId, locale),
                {
                    wrapper,
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(false))
            expect(result.current.data).toStrictEqual(undefined)
        })

        it('should not call the api function when client is not set', () => {
            getHelpCenterArticle.mockReturnValue(
                Promise.resolve(getSingleArticleEnglish),
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            const articleId = 1
            const locale = 'en-US'
            renderHook(
                () => useGetHelpCenterArticle(articleId, helpCenterId, locale),
                {
                    wrapper,
                },
            )

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(0)
        })
    })
    describe('useGetHelpCenter', () => {
        it('should return correct data on success', async () => {
            getHelpCenter.mockReturnValue(
                Promise.resolve(getSingleHelpCenterResponseFixture) as any,
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () => useGetHelpCenter(helpCenterId, {}),
                {
                    wrapper,
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(
                getSingleHelpCenterResponseFixture,
            )
        })

        it('should not call the api function when client is not set', () => {
            getHelpCenter.mockReturnValue(
                Promise.resolve(getSingleHelpCenterResponseFixture) as any,
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(() => useGetHelpCenter(helpCenterId, {}), {
                wrapper,
            })

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetMultiHelpCenter', () => {
        const helpCenterIds = [1, 2, 3]
        const queryParams: any = { locale: 'en-US' as const }

        const mockHelpCenters: any = [
            {
                ...getSingleHelpCenterResponseFixture,
                id: 1,
                subdomain: 'hc1',
            },
            {
                ...getSingleHelpCenterResponseFixture,
                id: 2,
                subdomain: 'hc2',
            },
            {
                ...getSingleHelpCenterResponseFixture,
                id: 3,
                subdomain: 'hc3',
            },
        ]

        beforeEach(() => {
            jest.clearAllMocks()
            getHelpCenter.mockClear()
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
        })

        it('should fetch multiple help centers', async () => {
            getHelpCenter
                .mockResolvedValueOnce(mockHelpCenters[0])
                .mockResolvedValueOnce(mockHelpCenters[1])
                .mockResolvedValueOnce(mockHelpCenters[2])

            const { result } = renderHook(
                () => useGetMultipleHelpCenter(helpCenterIds, {}, queryParams),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.helpCenters).toHaveLength(3)
            expect(result.current.helpCenters[0]).toEqual(mockHelpCenters[0])
            expect(result.current.helpCenters[1]).toEqual(mockHelpCenters[1])
            expect(result.current.helpCenters[2]).toEqual(mockHelpCenters[2])

            expect(getHelpCenter).toHaveBeenCalledTimes(3)
            expect(getHelpCenter).toHaveBeenNthCalledWith(
                1,
                expect.anything(),
                { help_center_id: helpCenterIds[0] },
                queryParams,
            )
            expect(getHelpCenter).toHaveBeenNthCalledWith(
                2,
                expect.anything(),
                { help_center_id: helpCenterIds[1] },
                queryParams,
            )
            expect(getHelpCenter).toHaveBeenNthCalledWith(
                3,
                expect.anything(),
                { help_center_id: helpCenterIds[2] },
                queryParams,
            )
        })

        it('should not call the api function when override disabled', () => {
            renderHook(
                () =>
                    useGetMultipleHelpCenter(
                        helpCenterIds,
                        { enabled: false },
                        queryParams,
                    ),
                { wrapper },
            )

            expect(getHelpCenter).not.toHaveBeenCalled()
        })
    })

    describe('useGetHelpCenterList', () => {
        it('should return correct data on success', async () => {
            getHelpCenterList.mockReturnValue(
                Promise.resolve(getHelpCentersResponseFixture) as any,
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(() => useGetHelpCenterList({}), {
                wrapper,
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(
                getHelpCentersResponseFixture,
            )
        })
        it('should not call the api function when client is not set', () => {
            getHelpCenterList.mockReturnValue(
                Promise.resolve(getHelpCentersResponseFixture) as any,
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(() => useGetHelpCenterList({}), {
                wrapper,
            })

            expect(getHelpCenterList).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetHelpCenterListMulti', () => {
        it('should return correct data on success', async () => {
            getHelpCenterList.mockReturnValue(
                Promise.resolve(getHelpCentersResponseFixture) as any,
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () => useGetHelpCenterListMulti([{}]),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual([
                getHelpCentersResponseFixture,
            ])
        })
        it('should not call the api function when client is not set', () => {
            getHelpCenterList.mockReturnValue(
                Promise.resolve(getHelpCentersResponseFixture) as any,
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(() => useGetHelpCenterListMulti([{}]), {
                wrapper,
            })

            expect(getHelpCenterList).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetArticleIngestionLogs', () => {
        it('should return correct data on success', async () => {
            getArticleIngestionLogs.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () =>
                    useGetArticleIngestionLogs(
                        { help_center_id: helpCenterId },
                        {},
                    ),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(null)
        })

        it('should not call the api function when enabled false', () => {
            getArticleIngestionLogs.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useGetArticleIngestionLogs(
                        { help_center_id: helpCenterId },
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )
            expect(getArticleIngestionLogs).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetArticleIngestionLogsList', () => {
        it('should return correct data on success', async () => {
            getArticleIngestionLogs.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () =>
                    useGetArticleIngestionLogsList(
                        [{ help_center_id: helpCenterId }],
                        {},
                    ),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual([
                { helpCenterId: 1, ingestionLogs: null },
            ])
        })

        it('should not call the api function when enabled false', () => {
            getArticleIngestionLogs.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useGetArticleIngestionLogsList(
                        [{ help_center_id: helpCenterId }],
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )
            expect(getArticleIngestionLogs).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetIngestionLogsList', () => {
        it('should return correct data on success', async () => {
            getIngestionLogs.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () =>
                    useGetIngestionLogsList(
                        [{ help_center_id: helpCenterId }],
                        {},
                    ),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual([
                { helpCenterId: 1, ingestionLogs: null },
            ])
        })

        it('should not call the api function when enabled false', () => {
            getIngestionLogs.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useGetIngestionLogsList(
                        [{ help_center_id: helpCenterId }],
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )
            expect(getIngestionLogs).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetIngestionLogs', () => {
        it('should return correct data on success', async () => {
            getIngestionLogs.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () => useGetIngestionLogs({ help_center_id: helpCenterId }, {}),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(null)
        })

        it('should not call the api function when enabled false', () => {
            getIngestionLogs.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useGetIngestionLogs(
                        { help_center_id: helpCenterId },
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )
            expect(getIngestionLogs).toHaveBeenCalledTimes(0)
        })
    })

    describe('useStartIngestion', () => {
        it('should return correct data on success', async () => {
            startIngestion.mockReturnValue(Promise.resolve(null))
            const { result } = renderHook(() => useStartIngestion(), {
                wrapper,
            })

            await result.current.mutateAsync([
                undefined,
                { help_center_id: helpCenterId },
                {
                    url: 'https://www.test.com',
                    type: 'domain',
                },
            ])

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toStrictEqual(null)
        })
    })

    describe('useListIngestedResources', () => {
        it('should return correct data on success', async () => {
            listIngestedResources.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () =>
                    useListIngestedResources(
                        {
                            help_center_id: helpCenterId,
                            article_ingestion_log_id: 1,
                        },
                        {},
                        {},
                    ),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(null)
        })

        it('should not call the api function when enabled false', () => {
            listIngestedResources.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useListIngestedResources(
                        {
                            help_center_id: helpCenterId,
                            article_ingestion_log_id: 1,
                        },
                        {},
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )
            expect(listIngestedResources).toHaveBeenCalledTimes(0)
        })

        it('should not call the api function when client is not set', () => {
            listIngestedResources.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(
                () =>
                    useListIngestedResources(
                        {
                            help_center_id: helpCenterId,
                            article_ingestion_log_id: 1,
                        },
                        {},
                        {},
                    ),
                {
                    wrapper,
                },
            )

            expect(listIngestedResources).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetIngestedResource', () => {
        it('should return correct data on success', async () => {
            getIngestedResource.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () =>
                    useGetIngestedResource(
                        {
                            help_center_id: helpCenterId,
                            id: 1,
                        },
                        {},
                    ),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(null)
        })

        it('should not call the api function when enabled false', () => {
            getIngestedResource.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useGetIngestedResource(
                        {
                            help_center_id: helpCenterId,
                            id: 1,
                        },
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )
            expect(listIngestedResources).toHaveBeenCalledTimes(0)
        })

        it('should not call the api function when client is not set', () => {
            getIngestedResource.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(
                () =>
                    useGetIngestedResource(
                        {
                            help_center_id: helpCenterId,
                            id: 1,
                        },
                        {},
                    ),
                {
                    wrapper,
                },
            )

            expect(listIngestedResources).toHaveBeenCalledTimes(0)
        })
    })

    describe('useUpdateIngestedResource', () => {
        it('should return correct data on success', async () => {
            updateIngestedResource.mockReturnValue(Promise.resolve(null))
            const { result } = renderHook(() => useUpdateIngestedResource(), {
                wrapper,
            })

            await result.current.mutateAsync([
                undefined,
                {
                    ingested_resource_id: 34,
                    help_center_id: helpCenterId,
                },
                { status: 'enabled' },
            ])

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toStrictEqual(null)
        })
    })

    describe('useUpdateAllIngestedResourcesStatus', () => {
        it('should ruseGetMultipleFileIngestionSnippetsss', async () => {
            updateAllIngestedResourcesStatus.mockReturnValue(
                Promise.resolve(null),
            )
            const { result } = renderHook(
                () => useUpdateAllIngestedResourcesStatus(),
                {
                    wrapper,
                },
            )

            await result.current.mutateAsync([
                undefined,
                {
                    article_ingestion_log_id: 34,
                    help_center_id: helpCenterId,
                },
                { status: 'enabled' },
            ])

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toStrictEqual(null)
        })
    })

    describe('useCreateFileIngestion', () => {
        it('should return correct data on success', async () => {
            createFileIngestion.mockReturnValue(Promise.resolve(null))
            const { result } = renderHook(() => useCreateFileIngestion(), {
                wrapper,
            })

            await result.current.mutateAsync([
                undefined,
                { help_center_id: helpCenterId },
                {
                    filename: 'my-file.pdf',
                    type: 'pdf',
                    size_bytes: 999999,
                    google_storage_url: 'https://cdn.google.com',
                },
            ])

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toStrictEqual(null)
        })
    })

    describe('useGetFileIngestion', () => {
        it('should return correct data on success', async () => {
            getFileIngestion.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () => useGetFileIngestion({ help_center_id: helpCenterId }, {}),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(null)
        })

        it('should call the api with the correct ids', () => {
            getFileIngestion.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            renderHook(
                () =>
                    useGetFileIngestion(
                        { help_center_id: helpCenterId, ids: [3, 7, 8] },
                        {},
                    ),
                {
                    wrapper,
                },
            )
            expect(getFileIngestion).toHaveBeenCalledWith(
                {},
                {
                    help_center_id: 1,
                    ids: [3, 7, 8],
                },
            )
        })

        it('should not call the api function when enabled false', () => {
            getFileIngestion.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useGetFileIngestion(
                        { help_center_id: helpCenterId },
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
            )
            expect(getFileIngestion).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetMultipleFileIngestion', () => {
        const helpCenterIds = [1, 2, 3]
        const mockFileData = [
            {
                id: 101,
                filename: 'file1.pdf',
                help_center_id: 1,
                google_storage_url: 'https://storage.googleapis.com/file1.pdf',
                status: 'SUCCESSFUL' as 'SUCCESSFUL' | 'FAILED' | 'PENDING',
                uploaded_datetime: '2023-01-01T00:00:00Z',
                snippets_article_ids: [],
            },
            {
                id: 102,
                filename: 'file2.pdf',
                help_center_id: 2,
                google_storage_url: 'https://storage.googleapis.com/file2.pdf',
                status: 'SUCCESSFUL' as 'SUCCESSFUL' | 'FAILED' | 'PENDING',
                uploaded_datetime: '2023-01-01T00:00:00Z',
                snippets_article_ids: [],
            },
            {
                id: 103,
                filename: 'file3.pdf',
                help_center_id: 3,
                google_storage_url: 'https://storage.googleapis.com/file3.pdf',
                status: 'SUCCESSFUL' as 'SUCCESSFUL' | 'FAILED' | 'PENDING',
                uploaded_datetime: '2023-01-01T00:00:00Z',
                snippets_article_ids: [],
            },
        ]

        const mockArticleData = [
            {
                id: 201,
                title: 'Article for file1',
            },
            {
                id: 202,
                title: 'Article for file2',
            },
            {
                id: 203,
                title: 'Article for file3',
            },
        ]

        beforeEach(() => {
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
        })

        it('should fetch files from multiple help centers and add helpCenterId to each file', async () => {
            getFileIngestion
                .mockResolvedValueOnce({
                    data: [mockFileData[0]],
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any,
                })
                .mockResolvedValueOnce({
                    data: [mockFileData[1]],
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any,
                })
                .mockResolvedValueOnce({
                    data: [mockFileData[2]],
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any,
                })

            // Mock getFileIngestionArticleTitlesAndStatus for each file
            getFileIngestionArticleTitlesAndStatus
                .mockResolvedValueOnce([mockArticleData[0]])
                .mockResolvedValueOnce([mockArticleData[1]])
                .mockResolvedValueOnce([mockArticleData[2]])

            const { result } = renderHook(
                () => useGetMultipleFileIngestionSnippets(helpCenterIds),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.ingestedFiles).toHaveLength(3)
            expect(result.current.ingestedFiles[0]).toEqual({
                ...mockArticleData[0],
                ingestionId: mockFileData[0].id,
                ingestionStatus: mockFileData[0].status,
                helpCenterId: helpCenterIds[0],
            })
            expect(result.current.ingestedFiles[1]).toEqual({
                ...mockArticleData[1],
                ingestionId: mockFileData[1].id,
                ingestionStatus: mockFileData[1].status,
                helpCenterId: helpCenterIds[1],
            })
            expect(result.current.ingestedFiles[2]).toEqual({
                ...mockArticleData[2],
                ingestionId: mockFileData[2].id,
                ingestionStatus: mockFileData[2].status,
                helpCenterId: helpCenterIds[2],
            })

            expect(getFileIngestion).toHaveBeenCalledTimes(3)
            expect(getFileIngestion).toHaveBeenNthCalledWith(
                1,
                expect.anything(),
                {
                    help_center_id: helpCenterIds[0],
                },
            )
            expect(getFileIngestion).toHaveBeenNthCalledWith(
                2,
                expect.anything(),
                {
                    help_center_id: helpCenterIds[1],
                },
            )
            expect(getFileIngestion).toHaveBeenNthCalledWith(
                3,
                expect.anything(),
                {
                    help_center_id: helpCenterIds[2],
                },
            )
        })

        it('should handle empty responses gracefully', async () => {
            getFileIngestion
                .mockResolvedValueOnce({
                    data: [],
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any,
                })
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({
                    data: [mockFileData[2]],
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any,
                })

            // Mock getFileIngestionArticleTitlesAndStatus for the third file only
            getFileIngestionArticleTitlesAndStatus.mockResolvedValueOnce([
                mockArticleData[2],
            ])

            const { result } = renderHook(
                () => useGetMultipleFileIngestionSnippets(helpCenterIds),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.ingestedFiles).toHaveLength(1)
            expect(result.current.ingestedFiles[0]).toEqual({
                ...mockArticleData[2],
                ingestionId: mockFileData[2].id,
                ingestionStatus: mockFileData[2].status,
                helpCenterId: helpCenterIds[2],
            })
        })

        it('should not call the api function when client is not set', () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })

            renderHook(
                () => useGetMultipleFileIngestionSnippets(helpCenterIds),
                {
                    wrapper,
                },
            )

            expect(getFileIngestion).not.toHaveBeenCalled()
        })

        it('should not call the api function for invalid helpCenterIds', async () => {
            getFileIngestion.mockResolvedValue({
                data: [],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            })

            renderHook(() => useGetMultipleFileIngestionSnippets([0, -1, 3]), {
                wrapper,
            })

            expect(getFileIngestion).toHaveBeenCalledTimes(1)
            expect(getFileIngestion).toHaveBeenCalledWith(expect.anything(), {
                help_center_id: 3,
            })
        })

        it('should filter articles by recordIds when provided', async () => {
            const mockFileWithMultipleArticles = {
                id: 105,
                filename: 'file-with-articles.pdf',
                help_center_id: 5,
                google_storage_url:
                    'https://storage.googleapis.com/file-with-articles.pdf',
                status: 'SUCCESSFUL' as 'SUCCESSFUL' | 'FAILED' | 'PENDING',
                uploaded_datetime: '2023-01-01T00:00:00Z',
                snippets_article_ids: [],
            }

            const mockMultipleArticles = [
                { id: 10, title: 'Article 10' },
                { id: 15, title: 'Article 15' },
                { id: 20, title: 'Article 20' },
            ]

            getFileIngestion.mockResolvedValue({
                data: [mockFileWithMultipleArticles],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            })

            getFileIngestionArticleTitlesAndStatus.mockResolvedValue(
                mockMultipleArticles,
            )

            const { result } = renderHook(
                () => useGetMultipleFileIngestionSnippets([5], [10, 20]), // Should filter to only articles 10 and 20
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(getFileIngestion).toHaveBeenCalledWith(expect.anything(), {
                help_center_id: 5,
            })

            expect(result.current.ingestedFiles).toHaveLength(2)
            expect(result.current.ingestedFiles[0]).toEqual({
                ...mockMultipleArticles[0],
                ingestionId: mockFileWithMultipleArticles.id,
                ingestionStatus: mockFileWithMultipleArticles.status,
                helpCenterId: 5,
            })
            expect(result.current.ingestedFiles[1]).toEqual({
                ...mockMultipleArticles[2], // Article 20 (index 2)
                ingestionId: mockFileWithMultipleArticles.id,
                ingestionStatus: mockFileWithMultipleArticles.status,
                helpCenterId: 5,
            })
        })
    })

    describe('useDeleteFileIngestion', () => {
        it('should return correct data on success', async () => {
            deleteFileIngestion.mockReturnValue(Promise.resolve(null))
            const { result } = renderHook(() => useDeleteFileIngestion(), {
                wrapper,
            })

            await result.current.mutateAsync([
                undefined,
                { help_center_id: helpCenterId, file_ingestion_id: 34 },
            ])

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toStrictEqual(null)
        })
    })

    describe('useGetArticleIngestionArticlesTitleAndStatus', () => {
        const pathParams = {
            help_center_id: 1,
            article_ingestion_id: 123,
        }

        beforeEach(() => {
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
        })

        it('should return article titles on success', async () => {
            const mockResponseData = [
                { id: 1, title: 'Article 1', visibilityStatus: 'PUBLIC' },
                { id: 2, title: 'Article 2', visibilityStatus: 'PUBLIC' },
            ]
            getArticleIngestionArticleTitlesAndStatus.mockResolvedValue(
                mockResponseData,
            )

            const { result } = renderHook(
                () => useGetArticleIngestionArticlesTitleAndStatus(pathParams),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toEqual(mockResponseData)
            expect(
                getArticleIngestionArticleTitlesAndStatus,
            ).toHaveBeenCalledWith(expect.any(Object), pathParams)
        })

        it('should not call the api function when client is not set', () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })

            renderHook(
                () => useGetArticleIngestionArticlesTitleAndStatus(pathParams),
                {
                    wrapper,
                },
            )

            expect(
                getArticleIngestionArticleTitlesAndStatus,
            ).not.toHaveBeenCalled()
        })

        it('should handle errors', async () => {
            const error = new Error('API Error')
            getArticleIngestionArticleTitlesAndStatus.mockRejectedValue(error)

            const { result } = renderHook(
                () => useGetArticleIngestionArticlesTitleAndStatus(pathParams),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toBe(error)
        })
    })

    describe('useGetFileIngestionArticleTitlesAndStatus', () => {
        const pathParams = {
            help_center_id: 1,
            file_ingestion_id: 456,
        }

        beforeEach(() => {
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
        })

        it('should return article titles on success', async () => {
            const mockResponse = {
                data: [
                    {
                        id: 1,
                        title: 'File Article 1',
                        visibilityStatus: 'PUBLIC',
                    },
                    {
                        id: 2,
                        title: 'File Article 2',
                        visibilityStatus: 'PUBLIC',
                    },
                ],
            }
            getFileIngestionArticleTitlesAndStatus.mockResolvedValue(
                mockResponse,
            )

            const { result } = renderHook(
                () => useGetFileIngestionArticleTitlesAndStatus(pathParams),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toEqual(mockResponse)
            expect(getFileIngestionArticleTitlesAndStatus).toHaveBeenCalledWith(
                expect.any(Object),
                pathParams,
            )
        })

        it('should not call the api function when client is not set', () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })

            renderHook(
                () => useGetFileIngestionArticleTitlesAndStatus(pathParams),
                {
                    wrapper,
                },
            )

            expect(
                getFileIngestionArticleTitlesAndStatus,
            ).not.toHaveBeenCalled()
        })

        it('should handle errors', async () => {
            const error = new Error('API Error')
            getFileIngestionArticleTitlesAndStatus.mockRejectedValue(error)

            const { result } = renderHook(
                () => useGetFileIngestionArticleTitlesAndStatus(pathParams),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toBe(error)
        })
    })

    describe('useGetKnowledgeStatus', () => {
        it('should return correct data on success', async () => {
            getKnowledgeStatus.mockReturnValue(Promise.resolve(null))
            const { result } = renderHook(() => useGetKnowledgeStatus({}), {
                wrapper,
            })
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(null)
        })

        it('should not call the api function when enabled false', () => {
            getKnowledgeStatus.mockReturnValue(Promise.resolve(null))
            renderHook(() => useGetKnowledgeStatus({ enabled: false }), {
                wrapper,
            })
            expect(getKnowledgeStatus).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetArticleTranslations', () => {
        const helpCenterId = 1
        const articleId = 123

        beforeEach(() => {
            mockUseHelpCenterApi.mockReturnValue({
                client: { listArticleTranslations: jest.fn() } as any,
                isReady: true,
            })
        })

        it('should return article translations on success', async () => {
            const mockResponse = {
                data: [
                    {
                        id: 1,
                        title: 'Translation 1',
                        locale: 'en-US',
                        article_id: articleId,
                        content: 'Content 1',
                    },
                    {
                        id: 2,
                        title: 'Translation 2',
                        locale: 'fr-FR',
                        article_id: articleId,
                        content: 'Content 2',
                    },
                ],
            }
            const mockClient = {
                listArticleTranslations: jest
                    .fn()
                    .mockResolvedValue({ data: mockResponse }),
            } as any
            mockUseHelpCenterApi.mockReturnValue({
                client: mockClient,
                isReady: true,
            })
            const { result } = renderHook(
                () => useGetArticleTranslations(helpCenterId, articleId),
                { wrapper },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toEqual(mockResponse)
            expect(mockClient.listArticleTranslations).toHaveBeenCalledWith({
                help_center_id: helpCenterId,
                article_id: articleId,
            })
        })

        it('should not call the api function when client is not set', () => {
            const mockClient = {
                listArticleTranslations: jest.fn(),
            } as any
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(
                () => useGetArticleTranslations(helpCenterId, articleId),
                { wrapper },
            )
            expect(mockClient.listArticleTranslations).not.toHaveBeenCalled()
        })

        it('should not call the api function when enabled is false', () => {
            const mockClient = {
                listArticleTranslations: jest.fn(),
            } as any
            mockUseHelpCenterApi.mockReturnValue({
                client: mockClient,
                isReady: true,
            })
            renderHook(
                () =>
                    useGetArticleTranslations(
                        helpCenterId,
                        articleId,
                        undefined,
                        { enabled: false },
                    ),
                { wrapper },
            )
            expect(mockClient.listArticleTranslations).not.toHaveBeenCalled()
        })

        it('should not call the api function when helpCenterId is undefined', () => {
            const mockClient = {
                listArticleTranslations: jest.fn(),
            } as any
            mockUseHelpCenterApi.mockReturnValue({
                client: mockClient,
                isReady: true,
            })
            renderHook(
                () => useGetArticleTranslations(undefined as any, articleId),
                { wrapper },
            )
            expect(mockClient.listArticleTranslations).not.toHaveBeenCalled()
        })

        it('should not call the api function when articleId is undefined', () => {
            const mockClient = {
                listArticleTranslations: jest.fn(),
            } as any
            mockUseHelpCenterApi.mockReturnValue({
                client: mockClient,
                isReady: true,
            })
            renderHook(
                () => useGetArticleTranslations(helpCenterId, undefined as any),
                { wrapper },
            )
            expect(mockClient.listArticleTranslations).not.toHaveBeenCalled()
        })

        it('should handle errors gracefully', async () => {
            const error = new Error('API Error')
            const mockClient = {
                listArticleTranslations: jest.fn().mockRejectedValue(error),
            } as any
            mockUseHelpCenterApi.mockReturnValue({
                client: mockClient,
                isReady: true,
            })
            const { result } = renderHook(
                () => useGetArticleTranslations(helpCenterId, articleId),
                { wrapper },
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toBe(error)
        })
    })

    describe('fetchAllPagesForHelpCenter', () => {
        const mockClient = {} as any
        const helpCenterId = 1
        const baseQueryParams = { locale: 'en-US' as const }

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should fetch single page when nb_pages is 1', async () => {
            const mockResponse = {
                data: [mockArticles[0]],
                meta: {
                    page: 1,
                    per_page: 1000,
                    current_page: '1',
                    item_count: 1,
                    nb_pages: 1,
                },
                object: 'list' as const,
            }
            getHelpCenterArticles.mockResolvedValue(mockResponse)

            const result = await fetchAllPagesForHelpCenter({
                client: mockClient,
                helpCenterId,
                queryParams: baseQueryParams,
            })

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(1)
            expect(getHelpCenterArticles).toHaveBeenCalledWith(
                mockClient,
                { help_center_id: helpCenterId },
                { ...baseQueryParams, page: 1 },
            )
            expect(result.data).toEqual([mockArticles[0]])
            expect(result.meta.item_count).toBe(1)
        })

        it('should fetch multiple pages when nb_pages > 1', async () => {
            const firstPageResponse = {
                data: [mockArticles[0]],
                meta: {
                    page: 1,
                    per_page: 1,
                    current_page: '1',
                    item_count: 3,
                    nb_pages: 3,
                },
                object: 'list',
            }
            const secondPageResponse = {
                data: [mockArticles[1]],
                meta: {
                    page: 2,
                    per_page: 1,
                    current_page: '2',
                    item_count: 3,
                    nb_pages: 3,
                },
                object: 'list',
            }
            const thirdPageResponse = {
                data: [mockArticles[2]],
                meta: {
                    page: 3,
                    per_page: 1,
                    current_page: '3',
                    item_count: 3,
                    nb_pages: 3,
                },
                object: 'list',
            }

            getHelpCenterArticles
                .mockResolvedValueOnce(firstPageResponse as any)
                .mockResolvedValueOnce(secondPageResponse as any)
                .mockResolvedValueOnce(thirdPageResponse as any)

            const result = await fetchAllPagesForHelpCenter({
                client: mockClient,
                helpCenterId,
                queryParams: baseQueryParams,
            })

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(3)
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                1,
                mockClient,
                { help_center_id: helpCenterId },
                { ...baseQueryParams, page: 1 },
            )
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                2,
                mockClient,
                { help_center_id: helpCenterId },
                { ...baseQueryParams, page: 2 },
            )
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                3,
                mockClient,
                { help_center_id: helpCenterId },
                { ...baseQueryParams, page: 3 },
            )

            expect(result.data).toEqual([
                mockArticles[0],
                mockArticles[1],
                mockArticles[2],
            ])
            expect(result.meta.item_count).toBe(3)
        })

        it('should handle empty first page response gracefully', async () => {
            const emptyResponse = {
                data: [],
                meta: {
                    page: 1,
                    per_page: 1000,
                    current_page: '1',
                    item_count: 0,
                    nb_pages: 1,
                },
                object: 'list',
            }
            getHelpCenterArticles.mockResolvedValue(emptyResponse as any)

            const result = await fetchAllPagesForHelpCenter({
                client: mockClient,
                helpCenterId,
                queryParams: baseQueryParams,
            })

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(1)
            expect(result.data).toEqual([])
            expect(result.meta.item_count).toBe(0)
        })

        it('should continue fetching when subsequent pages return null', async () => {
            const firstPageResponse = {
                data: [mockArticles[0]],
                meta: {
                    page: 1,
                    per_page: 1,
                    current_page: '1',
                    item_count: 2,
                    nb_pages: 2,
                },
                object: 'list',
            }

            getHelpCenterArticles
                .mockResolvedValueOnce(firstPageResponse as any)
                .mockResolvedValueOnce(null) // Second page returns null

            const result = await fetchAllPagesForHelpCenter({
                client: mockClient,
                helpCenterId,
                queryParams: baseQueryParams,
            })

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(2)
            expect(result.data).toEqual([mockArticles[0]])
            expect(result.meta.item_count).toBe(1)
        })

        it('should handle missing meta information', async () => {
            const responseWithoutMeta = {
                data: [mockArticles[0]],
                meta: null,
                object: 'list',
            }
            getHelpCenterArticles.mockResolvedValue(responseWithoutMeta as any)

            const result = await fetchAllPagesForHelpCenter({
                client: mockClient,
                helpCenterId,
                queryParams: baseQueryParams,
            })

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(1)
            expect(result.data).toEqual([mockArticles[0]])
            expect(result.meta).toEqual({
                item_count: 1,
                page: 1,
                per_page: 1000,
                current_page: '1',
                nb_pages: 1,
            })
        })

        it('should handle large number of pages efficiently', async () => {
            const pageSize = 100
            const totalItems = 2500 // Should result in 25 pages
            const totalPages = Math.ceil(totalItems / pageSize)

            // Mock first page response
            const firstPageResponse = {
                data: Array(pageSize).fill(mockArticles[0]),
                meta: {
                    page: 1,
                    per_page: pageSize,
                    current_page: '1',
                    item_count: totalItems,
                    nb_pages: totalPages,
                },
                object: 'list',
            }

            // Setup mock to return appropriate responses for each page
            getHelpCenterArticles.mockResolvedValue({
                data: Array(pageSize).fill(mockArticles[0]),
                meta: firstPageResponse.meta,
                object: 'list',
            })

            const result = await fetchAllPagesForHelpCenter({
                client: mockClient,
                helpCenterId,
                queryParams: { ...baseQueryParams, per_page: pageSize },
            })

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(totalPages)
            expect(result.data).toHaveLength(totalItems)
            expect(result.meta.item_count).toBe(totalItems)

            // Verify first and last page calls
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                1,
                mockClient,
                { help_center_id: helpCenterId },
                { ...baseQueryParams, per_page: pageSize, page: 1 },
            )
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                totalPages,
                mockClient,
                { help_center_id: helpCenterId },
                { ...baseQueryParams, per_page: pageSize, page: totalPages },
            )
        })
    })

    describe('useListIntents', () => {
        const helpCenterId = 1

        beforeEach(() => {
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
        })

        it('should return intents data on success', async () => {
            const mockIntentsResponse = {
                intents: [
                    {
                        id: 1,
                        name: 'Shipping Policy',
                        status: 'linked' as const,
                        article_id: 101,
                        article_unlisted_id: 'abc123',
                    },
                    {
                        id: 2,
                        name: 'Return Policy',
                        status: 'unlinked' as const,
                        article_id: null,
                        article_unlisted_id: null,
                    },
                ],
            }

            listIntents.mockResolvedValue(mockIntentsResponse)

            const { result } = renderHook(() => useListIntents(helpCenterId), {
                wrapper,
            })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toEqual(mockIntentsResponse)
            expect(listIntents).toHaveBeenCalledWith(expect.any(Object), {
                help_center_id: helpCenterId,
            })
        })

        it('should not call the api function when client is not set', () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })

            renderHook(() => useListIntents(helpCenterId), {
                wrapper,
            })

            expect(listIntents).not.toHaveBeenCalled()
        })

        it('should not call the api function when enabled is false', () => {
            renderHook(() => useListIntents(helpCenterId, { enabled: false }), {
                wrapper,
            })

            expect(listIntents).not.toHaveBeenCalled()
        })

        it('should not call the api function when helpCenterId is undefined', () => {
            renderHook(() => useListIntents(undefined as any), {
                wrapper,
            })

            expect(listIntents).not.toHaveBeenCalled()
        })
    })
})
