import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {
    getHelpCentersResponseFixture,
    getSingleHelpCenterResponseFixture,
} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { HelpCenterClient } from 'rest_api/help_center_api/client'
import { Components } from 'rest_api/help_center_api/client.generated'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { HELP_CENTER_ROOT_CATEGORY_ID } from '../../../pages/settings/helpCenter/constants'
import {
    useCreateFileIngestion,
    useDeleteFileIngestion,
    useGetArticleIngestionLogs,
    useGetArticleIngestionLogsList,
    useGetFileIngestion,
    useGetHelpCenter,
    useGetHelpCenterArticle,
    useGetHelpCenterArticleList,
    useGetHelpCenterCategoryTree,
    useGetHelpCenterList,
    useGetHelpCenterListMulti,
    useGetIngestedResource,
    useGetIngestionLogs,
    useGetIngestionLogsList,
    useGetMultipleFileIngestion,
    useGetMultipleHelpCenterArticleLists,
    useListIngestedResources,
    useStartArticleIngestion,
    useStartIngestion,
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
const startArticleIngestion = jest.spyOn(resources, 'startArticleIngestion')
const getIngestionLogs = jest.spyOn(resources, 'getIngestionLogs')
const startIngestion = jest.spyOn(resources, 'startIngestion')
const listIngestedResources = jest.spyOn(resources, 'listIngestedResources')
const getIngestedResource = jest.spyOn(resources, 'getIngestedResource')
const updateIngestedResource = jest.spyOn(resources, 'updateIngestedResource')
const createFileIngestion = jest.spyOn(resources, 'createFileIngestion')
const getFileIngestion = jest.spyOn(resources, 'getFileIngestion')
const deleteFileIngestion = jest.spyOn(resources, 'deleteFileIngestion')

const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const helpCenterId = 1
const mockUseHelpCenterApi = jest.mocked(useHelpCenterApi)

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
                queryParams,
            )
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                2,
                expect.anything(),
                { help_center_id: helpCenterIds[1] },
                queryParams,
            )
            expect(getHelpCenterArticles).toHaveBeenNthCalledWith(
                3,
                expect.anything(),
                { help_center_id: helpCenterIds[2] },
                queryParams,
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
                queryParams,
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

    describe('useCreateArticleIngestion', () => {
        it('should return correct data on success', async () => {
            startArticleIngestion.mockReturnValue(Promise.resolve(null))
            const { result } = renderHook(() => useStartArticleIngestion(), {
                wrapper,
            })

            await result.current.mutateAsync([
                undefined,
                { help_center_id: helpCenterId },
                { links: [] },
            ])

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toStrictEqual(null)
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
        const fileIds = [101, 102, 103]
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

            const { result } = renderHook(
                () =>
                    useGetMultipleFileIngestion(helpCenterIds, {
                        ids: fileIds,
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.ingestedFiles).toHaveLength(3)
            expect(result.current.ingestedFiles[0]).toEqual({
                ...mockFileData[0],
                helpCenterId: helpCenterIds[0],
            })
            expect(result.current.ingestedFiles[1]).toEqual({
                ...mockFileData[1],
                helpCenterId: helpCenterIds[1],
            })
            expect(result.current.ingestedFiles[2]).toEqual({
                ...mockFileData[2],
                helpCenterId: helpCenterIds[2],
            })

            expect(getFileIngestion).toHaveBeenCalledTimes(3)
            expect(getFileIngestion).toHaveBeenNthCalledWith(
                1,
                expect.anything(),
                {
                    help_center_id: helpCenterIds[0],
                    ids: fileIds,
                },
            )
            expect(getFileIngestion).toHaveBeenNthCalledWith(
                2,
                expect.anything(),
                {
                    help_center_id: helpCenterIds[1],
                    ids: fileIds,
                },
            )
            expect(getFileIngestion).toHaveBeenNthCalledWith(
                3,
                expect.anything(),
                {
                    help_center_id: helpCenterIds[2],
                    ids: fileIds,
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

            const { result } = renderHook(
                () => useGetMultipleFileIngestion(helpCenterIds),
                { wrapper },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.ingestedFiles).toHaveLength(1)
            expect(result.current.ingestedFiles[0]).toEqual({
                ...mockFileData[2],
                helpCenterId: helpCenterIds[2],
            })
        })

        it('should not call the api function when client is not set', () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })

            renderHook(() => useGetMultipleFileIngestion(helpCenterIds), {
                wrapper,
            })

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

            renderHook(() => useGetMultipleFileIngestion([0, -1, 3]), {
                wrapper,
            })

            expect(getFileIngestion).toHaveBeenCalledTimes(1)
            expect(getFileIngestion).toHaveBeenCalledWith(expect.anything(), {
                help_center_id: 3,
            })
        })

        it('should pass optional file ids when provided', async () => {
            getFileIngestion.mockResolvedValue({
                data: [],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            })

            renderHook(
                () => useGetMultipleFileIngestion([5], { ids: [10, 20] }),
                { wrapper },
            )

            expect(getFileIngestion).toHaveBeenCalledWith(expect.anything(), {
                help_center_id: 5,
                ids: [10, 20],
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
})
