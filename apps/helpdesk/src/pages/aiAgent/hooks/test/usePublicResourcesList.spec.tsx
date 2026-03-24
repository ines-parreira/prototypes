import type React from 'react'

import { reportError } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import * as resources from 'models/helpCenter/resources'
import { usePublicResourcesList } from 'pages/aiAgent/hooks/usePublicResourcesList'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { buildSDKMocks } from 'rest_api/help_center_api/tests/buildSdkMocks'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('@repo/logging')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')

const getArticleIngestionLogsSpy = jest.spyOn(
    resources,
    'getArticleIngestionLogs',
)
const getHelpCenterListSpy = jest.spyOn(resources, 'getHelpCenterList')
const mockReportError = jest.mocked(reportError)

const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>

const articleIngestionLogDtoFixture = (
    overrides?: Partial<Components.Schemas.ArticleIngestionLogDto>,
): Components.Schemas.ArticleIngestionLogDto => {
    return {
        id: 1,
        status: 'SUCCESSFUL',
        url: 'https://example.com',
        created_datetime: '2021-01-01T00:00:00.000Z',
        ...overrides,
    } as Components.Schemas.ArticleIngestionLogDto
}
const queryClient = mockQueryClient()
const STORE_NAME_1 = 'My Store'
const STORE_NAME_2 = 'My Other Store'
const STORE_NAME_3 = 'My Third Store'
const STORE_NAME_1_SNIPPET_ID_1 = 101
const STORE_NAME_1_SNIPPET_ID_2 = 102
const STORE_NAME_2_SNIPPET_ID_1 = 103
const STORE_NAME_3_SNIPPET_ID_1 = 104
const STORE_NAME_1_SNIPPET_ID_1_INGESTION_LOG_1 = 201
const STORE_NAME_1_SNIPPET_ID_1_INGESTION_LOG_2 = 202
const STORE_NAME_1_SNIPPET_ID_2_INGESTION_LOG_1 = 203
const STORE_NAME_1_SNIPPET_ID_2_INGESTION_LOG_2 = 204
const STORE_NAME_2_SNIPPET_ID_1_INGESTION_LOG_1 = 205
const STORE_NAME_2_SNIPPET_ID_1_INGESTION_LOG_2 = 206

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('usePublicResourcesList', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })

        getHelpCenterListSpy.mockImplementation((_, args) => {
            if (args.shop_name === STORE_NAME_1) {
                return Promise.resolve(
                    axiosSuccessResponse({
                        data: [
                            {
                                ...getSingleHelpCenterResponseFixture,
                                id: STORE_NAME_1_SNIPPET_ID_1,
                                shop_name: STORE_NAME_1,
                            },
                            {
                                ...getSingleHelpCenterResponseFixture,
                                id: STORE_NAME_1_SNIPPET_ID_2,
                                shop_name: STORE_NAME_1,
                            },
                        ],
                        object: 'list',
                        meta: {
                            page: 1,
                            per_page: 20,
                            current_page: '/help-centers?page=1&per_page=20',
                            item_count: 2,
                            nb_pages: 1,
                        },
                    }),
                ) as any
            }

            if (args.shop_name === STORE_NAME_2) {
                return Promise.resolve(
                    axiosSuccessResponse({
                        data: [
                            {
                                ...getSingleHelpCenterResponseFixture,
                                id: STORE_NAME_2_SNIPPET_ID_1,
                                shop_name: STORE_NAME_2,
                            },
                        ],
                        object: 'list',
                        meta: {
                            page: 1,
                            per_page: 20,
                            current_page: '/help-centers?page=1&per_page=20',
                            item_count: 1,
                            nb_pages: 1,
                        },
                    }),
                ) as any
            }

            if (args.shop_name === STORE_NAME_3) {
                return Promise.resolve(
                    axiosSuccessResponse({
                        data: [
                            {
                                ...getSingleHelpCenterResponseFixture,
                                id: STORE_NAME_3_SNIPPET_ID_1,
                                shop_name: STORE_NAME_3,
                            },
                        ],
                        object: 'list',
                        meta: {
                            page: 1,
                            per_page: 20,
                            current_page: '/help-centers?page=1&per_page=20',
                            item_count: 1,
                            nb_pages: 1,
                        },
                    }),
                ) as any
            }

            return Promise.reject('Boom!')
        })

        getArticleIngestionLogsSpy.mockImplementation((_, args) => {
            if (args.help_center_id === STORE_NAME_1_SNIPPET_ID_1) {
                return Promise.resolve([
                    articleIngestionLogDtoFixture({
                        id: STORE_NAME_1_SNIPPET_ID_1_INGESTION_LOG_1,
                        created_datetime: '2022-01-01T00:00:00.000Z',
                    }),
                    articleIngestionLogDtoFixture({
                        id: STORE_NAME_1_SNIPPET_ID_1_INGESTION_LOG_2,
                        created_datetime: '2021-01-01T00:00:00.000Z',
                    }),
                ])
            }

            if (args.help_center_id === STORE_NAME_1_SNIPPET_ID_2) {
                return Promise.resolve([
                    articleIngestionLogDtoFixture({
                        id: STORE_NAME_1_SNIPPET_ID_2_INGESTION_LOG_1,
                        created_datetime: '2021-01-01T00:00:00.000Z',
                    }),
                    articleIngestionLogDtoFixture({
                        id: STORE_NAME_1_SNIPPET_ID_2_INGESTION_LOG_2,
                        created_datetime: '2022-01-01T00:00:00.000Z',
                    }),
                ])
            }

            if (args.help_center_id === STORE_NAME_2_SNIPPET_ID_1) {
                return Promise.resolve([
                    articleIngestionLogDtoFixture({
                        id: STORE_NAME_2_SNIPPET_ID_1_INGESTION_LOG_1,
                        created_datetime: '2021-01-01T00:00:00.000Z',
                    }),
                    articleIngestionLogDtoFixture({
                        id: STORE_NAME_2_SNIPPET_ID_1_INGESTION_LOG_2,
                        created_datetime: '2022-01-01T00:00:00.000Z',
                    }),
                ])
            }

            return Promise.reject('Boom!')
        })
    })

    it('should return sourceItems per help center', async () => {
        const { result } = renderHook(
            () =>
                usePublicResourcesList({
                    shopNames: [STORE_NAME_1, STORE_NAME_2],
                }),
            {
                wrapper,
            },
        )

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        // We don't have STORE_NAME_1_SNIPPET_ID_1_INGESTION_LOG_* because we take only 1st store.
        expect(result.current.sourceItems).toEqual({
            [STORE_NAME_2]: [
                {
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                    id: STORE_NAME_2_SNIPPET_ID_1_INGESTION_LOG_1,
                    status: 'done',
                    url: 'https://example.com',
                },
                {
                    createdDatetime: '2022-01-01T00:00:00.000Z',
                    id: STORE_NAME_2_SNIPPET_ID_1_INGESTION_LOG_2,
                    status: 'done',
                    url: 'https://example.com',
                },
            ],
            [STORE_NAME_1]: [
                {
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                    id: STORE_NAME_1_SNIPPET_ID_1_INGESTION_LOG_2,
                    status: 'done',
                    url: 'https://example.com',
                },
                {
                    createdDatetime: '2022-01-01T00:00:00.000Z',
                    id: STORE_NAME_1_SNIPPET_ID_1_INGESTION_LOG_1,
                    status: 'done',
                    url: 'https://example.com',
                },
            ],
        })
        expect(mockReportError).not.toHaveBeenCalled()
    })

    it('should report errors', async () => {
        const { result } = renderHook(
            () =>
                usePublicResourcesList({
                    shopNames: [STORE_NAME_3],
                }),
            {
                wrapper,
            },
        )

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.sourceItems).toBeUndefined()
            expect(mockReportError).toHaveBeenCalled()
        })
    })
})
