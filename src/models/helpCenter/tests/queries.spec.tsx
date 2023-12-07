import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {
    useGetHelpCenterArticleList,
    useGetHelpCenterCategoryTree,
} from '../queries'
import * as resources from '../resources'
import {HELP_CENTER_ROOT_CATEGORY_ID} from '../../../pages/settings/helpCenter/constants'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

const getHelpCenterArticles = jest.spyOn(resources, 'getHelpCenterArticles')
const getCategoryTree = jest.spyOn(resources, 'getCategoryTree')

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
})
