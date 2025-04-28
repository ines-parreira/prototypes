import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {
    getHelpCentersResponseFixture,
    getSingleHelpCenterResponseFixture,
} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { HelpCenterClient } from 'rest_api/help_center_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { HELP_CENTER_ROOT_CATEGORY_ID } from '../../../pages/settings/helpCenter/constants'
import {
    useCreateFileIngestion,
    useDeleteFileIngestion,
    useGetArticleIngestionLogs,
    useGetFileIngestion,
    useGetHelpCenter,
    useGetHelpCenterArticle,
    useGetHelpCenterArticleList,
    useGetHelpCenterCategoryTree,
    useGetHelpCenterList,
    useGetIngestionLogs,
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
            const { result, waitFor } = renderHook(
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

    describe('useGetHelpCenterCategoryTree', () => {
        it('should return correct data on success', async () => {
            getCategoryTree.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result, waitFor } = renderHook(
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
            const { result, waitFor } = renderHook(
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
            const { result, waitFor } = renderHook(
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
            const { result, waitFor } = renderHook(
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
            const { result, waitFor } = renderHook(
                () => useGetHelpCenterList({}),
                { wrapper },
            )

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

    describe('useGetArticleIngestionLogs', () => {
        it('should return correct data on success', async () => {
            getArticleIngestionLogs.mockReturnValue(Promise.resolve(null))
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result, waitFor } = renderHook(
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

    describe('useCreateArticleIngestion', () => {
        it('should return correct data on success', async () => {
            startArticleIngestion.mockReturnValue(Promise.resolve(null))
            const { result, waitFor } = renderHook(
                () => useStartArticleIngestion(),
                { wrapper },
            )

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
            const { result, waitFor } = renderHook(
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
            const { result, waitFor } = renderHook(() => useStartIngestion(), {
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
            const { result, waitFor } = renderHook(
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

    describe('useUpdateIngestedResource', () => {
        it('should return correct data on success', async () => {
            updateIngestedResource.mockReturnValue(Promise.resolve(null))
            const { result, waitFor } = renderHook(
                () => useUpdateIngestedResource(),
                { wrapper },
            )

            await result.current.mutateAsync([
                undefined,
                {
                    ingested_resource_id: 34,
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
            const { result, waitFor } = renderHook(
                () => useCreateFileIngestion(),
                { wrapper },
            )

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
            const { result, waitFor } = renderHook(
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

    describe('useDeleteFileIngestion', () => {
        it('should return correct data on success', async () => {
            deleteFileIngestion.mockReturnValue(Promise.resolve(null))
            const { result, waitFor } = renderHook(
                () => useDeleteFileIngestion(),
                { wrapper },
            )

            await result.current.mutateAsync([
                undefined,
                { help_center_id: helpCenterId, file_ingestion_id: 34 },
            ])

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toStrictEqual(null)
        })
    })
})
