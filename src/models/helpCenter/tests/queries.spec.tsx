import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {
    getHelpCentersResponseFixture,
    getSingleHelpCenterResponseFixture,
} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getSingleArticleEnglish} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {
    useGetHelpCenterArticleList,
    useGetHelpCenter,
    useGetHelpCenterArticle,
    useGetHelpCenterCategoryTree,
    useGetHelpCenterList,
    useGetArticleIngestionLogs,
    useStartArticleIngestion,
} from '../queries'
import * as resources from '../resources'
import {HELP_CENTER_ROOT_CATEGORY_ID} from '../../../pages/settings/helpCenter/constants'

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

const queryClient = mockQueryClient()
const wrapper = ({children}: any) => (
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
            const {result, waitFor} = renderHook(
                () => useGetHelpCenterArticleList(helpCenterId, {}),
                {
                    wrapper,
                }
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
                        {enabled: false}
                    ),
                {
                    wrapper,
                }
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
                        {enabled: true}
                    ),
                {
                    wrapper,
                }
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
            const {result, waitFor} = renderHook(
                () =>
                    useGetHelpCenterCategoryTree(
                        helpCenterId,
                        HELP_CENTER_ROOT_CATEGORY_ID,
                        {
                            locale: 'en-US',
                        }
                    ),
                {
                    wrapper,
                }
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
                        {enabled: false}
                    ),
                {
                    wrapper,
                }
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
                        {enabled: false}
                    ),
                {
                    wrapper,
                }
            )

            expect(getCategoryTree).toHaveBeenCalledTimes(0)
        })
    })

    describe('useGetHelpCenterArticle ', () => {
        it('should return correct data on success', async () => {
            getHelpCenterArticle.mockReturnValue(
                Promise.resolve(getSingleArticleEnglish)
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const articleId = 1
            const locale = 'en-US'
            const {result, waitFor} = renderHook(
                () => useGetHelpCenterArticle(articleId, helpCenterId, locale),
                {
                    wrapper,
                }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(getSingleArticleEnglish)
        })
        it('should return undefined if arguments not provided', async () => {
            getHelpCenterArticle.mockReturnValue(
                Promise.resolve(getSingleArticleEnglish)
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const articleId = 1
            const locale = 'en-US'
            const {result, waitFor} = renderHook(
                () => useGetHelpCenterArticle(articleId, helpCenterId, locale),
                {
                    wrapper,
                }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(false))
            expect(result.current.data).toStrictEqual(undefined)
        })

        it('should not call the api function when client is not set', () => {
            getHelpCenterArticle.mockReturnValue(
                Promise.resolve(getSingleArticleEnglish)
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
                }
            )

            expect(getHelpCenterArticles).toHaveBeenCalledTimes(0)
        })
    })
    describe('useGetHelpCenter', () => {
        it('should return correct data on success', async () => {
            getHelpCenter.mockReturnValue(
                Promise.resolve(getSingleHelpCenterResponseFixture) as any
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const {result, waitFor} = renderHook(
                () => useGetHelpCenter(helpCenterId, {}),
                {
                    wrapper,
                }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(
                getSingleHelpCenterResponseFixture
            )
        })

        it('should not call the api function when client is not set', () => {
            getHelpCenter.mockReturnValue(
                Promise.resolve(getSingleHelpCenterResponseFixture) as any
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
                Promise.resolve(getHelpCentersResponseFixture) as any
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const {result, waitFor} = renderHook(
                () => useGetHelpCenterList({}),
                {wrapper}
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(
                getHelpCentersResponseFixture
            )
        })
        it('should not call the api function when client is not set', () => {
            getHelpCenterList.mockReturnValue(
                Promise.resolve(getHelpCentersResponseFixture) as any
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
            const {result, waitFor} = renderHook(
                () =>
                    useGetArticleIngestionLogs(
                        {help_center_id: helpCenterId},
                        {}
                    ),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(null)
        })

        it('should not call the api function when enabled false', () => {
            getArticleIngestionLogs.mockReturnValue(Promise.resolve(null))
            renderHook(
                () =>
                    useGetArticleIngestionLogs(
                        {help_center_id: helpCenterId},
                        {enabled: false}
                    ),
                {
                    wrapper,
                }
            )
            expect(getArticleIngestionLogs).toHaveBeenCalledTimes(0)
        })
    })

    describe('useCreateArticleIngestion', () => {
        it('should return correct data on success', async () => {
            startArticleIngestion.mockReturnValue(Promise.resolve(null))
            const {result, waitFor} = renderHook(
                () => useStartArticleIngestion(),
                {wrapper}
            )

            await result.current.mutateAsync([
                undefined,
                {help_center_id: helpCenterId},
                {links: []},
            ])

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toStrictEqual(null)
        })
    })
})
