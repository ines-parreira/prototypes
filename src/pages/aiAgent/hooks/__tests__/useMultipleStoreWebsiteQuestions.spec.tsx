import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import * as resources from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { Components } from 'rest_api/help_center_api/client.generated'
import { buildSDKMocks } from 'rest_api/help_center_api/tests/buildSdkMocks'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import * as errors from 'utils/errors'
import { renderHook } from 'utils/testing/renderHook'

import { useMultipleStoreWebsiteQuestions } from '../useMultipleStoreWebsiteQuestions'
import { useStoresDomainIngestionLogs } from '../useStoresDomainIngestionLogs'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
jest.mock('../useStoresDomainIngestionLogs')
jest.mock('models/helpCenter/resources')
jest.mock('utils/errors')

const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>
const mockedUseStoresDomainIngestionLogs =
    useStoresDomainIngestionLogs as jest.MockedFunction<
        typeof useStoresDomainIngestionLogs
    >
const listIngestedResourcesSpy = jest.spyOn(resources, 'listIngestedResources')
const reportErrorSpy = jest.spyOn(errors, 'reportError')

const queryClient = mockQueryClient()

// Test data
const SHOP_NAME = 'test-shop'
const HELP_CENTER_ID_1 = 100
const HELP_CENTER_ID_2 = 200
const INGESTION_LOG_ID_1 = 1001
const INGESTION_LOG_ID_2 = 1002

const mockIngestedResourceDto = (
    overrides?: Partial<Components.Schemas.IngestedResourceListDataDto>,
): Components.Schemas.IngestedResourceListDataDto =>
    ({
        id: 1,
        title: 'Test Resource',
        web_pages: [
            {
                url: 'https://example.com/test',
                title: 'Test Page',
                pageType: 'PRODUCT',
            } as any,
        ],
        ...overrides,
    }) as Components.Schemas.IngestedResourceListDataDto

const mockIngestedResourceResponse = (
    data: Components.Schemas.IngestedResourceListDataDto[],
): Components.Schemas.IngestedResourceListPageDto => ({
    data,
    object: 'list',
    meta: {
        page: 1,
        per_page: 1000,
        current_page: '/ingested-resources?page=1',
        item_count: data.length,
        nb_pages: 1,
    },
})

describe('useMultipleStoreWebsiteQuestions', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        jest.clearAllMocks()
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()

        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })

        mockedUseStoresDomainIngestionLogs.mockReturnValue({
            data: {
                [SHOP_NAME]: [
                    {
                        id: INGESTION_LOG_ID_1,
                        status: 'SUCCESSFUL',
                        created_datetime: '2023-01-01T00:00:00Z',
                        source: 'domain',
                        url: `https://${SHOP_NAME}.myshopify.com`,
                        latest_sync: '2023-01-01T00:00:00Z',
                        help_center_id: 1,
                        article_ids: [],
                        dataset_id: 1,
                        domain: `https://${SHOP_NAME}.myshopify.com`,
                        meta: {},
                    } as any,
                ],
            },
            isLoading: false,
        })

        listIngestedResourcesSpy.mockResolvedValue(
            mockIngestedResourceResponse([
                mockIngestedResourceDto({ id: 1, title: 'Resource 1' }),
                mockIngestedResourceDto({ id: 2, title: 'Resource 2' }),
            ]),
        )
    })

    const renderUseMultipleStoreWebsiteQuestions = (
        snippetHelpCenterIds: number[] = [HELP_CENTER_ID_1],
        shopName: string = SHOP_NAME,
        queryOptionsOverrides?: any,
    ) => {
        return renderHook(
            () =>
                useMultipleStoreWebsiteQuestions({
                    snippetHelpCenterIds,
                    shopName,
                    queryOptionsOverrides,
                }),
            {
                wrapper: ({ children }: { children?: React.ReactNode }) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )
    }

    describe('successful data fetching', () => {
        it('should return store website questions with transformed data', async () => {
            const { result } = renderUseMultipleStoreWebsiteQuestions()

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toEqual([
                {
                    id: 1,
                    title: 'Resource 1',
                    helpCenterId: HELP_CENTER_ID_1,
                    web_pages: [
                        {
                            url: 'https://example.com/test',
                            title: 'Test Page',
                            pageType: 'PRODUCT',
                        },
                    ],
                },
                {
                    id: 2,
                    title: 'Resource 2',
                    helpCenterId: HELP_CENTER_ID_1,
                    web_pages: [
                        {
                            url: 'https://example.com/test',
                            title: 'Test Page',
                            pageType: 'PRODUCT',
                        },
                    ],
                },
            ])

            expect(listIngestedResourcesSpy).toHaveBeenCalledWith(
                sdkMocks.client,
                {
                    help_center_id: HELP_CENTER_ID_1,
                    article_ingestion_log_id: INGESTION_LOG_ID_1,
                },
                {
                    page: 1,
                    per_page: 1000,
                },
            )
        })

        it('should handle multiple help center IDs', async () => {
            mockedUseStoresDomainIngestionLogs.mockReturnValue({
                data: {
                    [SHOP_NAME]: [
                        {
                            id: INGESTION_LOG_ID_1,
                            status: 'SUCCESSFUL',
                            created_datetime: '2023-01-01T00:00:00Z',
                            source: 'domain',
                            url: `https://${SHOP_NAME}.myshopify.com`,
                            latest_sync: '2023-01-01T00:00:00Z',
                        } as any,
                        {
                            id: INGESTION_LOG_ID_2,
                            status: 'SUCCESSFUL',
                            created_datetime: '2023-01-02T00:00:00Z',
                            source: 'domain',
                            url: `https://${SHOP_NAME}.myshopify.com`,
                            latest_sync: '2023-01-02T00:00:00Z',
                        } as any,
                    ],
                },
                isLoading: false,
            })

            listIngestedResourcesSpy
                .mockResolvedValueOnce(
                    mockIngestedResourceResponse([
                        mockIngestedResourceDto({
                            id: 1,
                            title: 'HC1 Resource',
                        }),
                    ]),
                )
                .mockResolvedValueOnce(
                    mockIngestedResourceResponse([
                        mockIngestedResourceDto({
                            id: 2,
                            title: 'HC2 Resource',
                        }),
                    ]),
                )

            const { result } = renderUseMultipleStoreWebsiteQuestions([
                HELP_CENTER_ID_1,
                HELP_CENTER_ID_2,
            ])

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toEqual([
                {
                    id: 1,
                    title: 'HC1 Resource',
                    helpCenterId: HELP_CENTER_ID_1,
                    web_pages: [
                        {
                            url: 'https://example.com/test',
                            title: 'Test Page',
                            pageType: 'PRODUCT',
                        },
                    ],
                },
                {
                    id: 2,
                    title: 'HC2 Resource',
                    helpCenterId: HELP_CENTER_ID_2,
                    web_pages: [
                        {
                            url: 'https://example.com/test',
                            title: 'Test Page',
                            pageType: 'PRODUCT',
                        },
                    ],
                },
            ])

            expect(listIngestedResourcesSpy).toHaveBeenCalledTimes(2)
        })

        it('should return empty array when no ingestion log is available', () => {
            mockedUseStoresDomainIngestionLogs.mockReturnValue({
                data: {
                    [SHOP_NAME]: [],
                },
                isLoading: false,
            })

            const { result } = renderUseMultipleStoreWebsiteQuestions()

            expect(result.current.storeWebsiteQuestions).toEqual([])
            expect(listIngestedResourcesSpy).not.toHaveBeenCalled()
        })

        it('should return empty array when help center client is not available', () => {
            mockedUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })

            const { result } = renderUseMultipleStoreWebsiteQuestions()

            expect(result.current.storeWebsiteQuestions).toEqual([])
            expect(listIngestedResourcesSpy).not.toHaveBeenCalled()
        })

        it('should handle empty response data correctly', async () => {
            listIngestedResourcesSpy.mockResolvedValue(
                mockIngestedResourceResponse([]),
            )

            const { result } = renderUseMultipleStoreWebsiteQuestions()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toEqual([])
        })

        it('should handle null response correctly', async () => {
            listIngestedResourcesSpy.mockResolvedValue(null)

            const { result } = renderUseMultipleStoreWebsiteQuestions()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toEqual([])
        })
    })

    describe('loading states', () => {
        it('should return loading true when ingestion logs are loading', () => {
            mockedUseStoresDomainIngestionLogs.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const { result } = renderUseMultipleStoreWebsiteQuestions()

            expect(result.current.isLoading).toBe(true)
            expect(result.current.storeWebsiteQuestions).toEqual([])
        })

        it('should return loading true initially', () => {
            const { result } = renderUseMultipleStoreWebsiteQuestions()

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('query options', () => {
        it('should respect queryOptionsOverrides enabled flag', () => {
            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: false },
            )

            expect(result.current.storeWebsiteQuestions).toEqual([])
            expect(listIngestedResourcesSpy).not.toHaveBeenCalled()
        })

        it('should call queries when enabled is true', async () => {
            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(listIngestedResourcesSpy).toHaveBeenCalled()
        })
    })

    describe('error handling', () => {
        it('should report errors when queries fail', async () => {
            const testError = new Error('API Error')
            listIngestedResourcesSpy.mockRejectedValue(testError)

            const { result } = renderUseMultipleStoreWebsiteQuestions()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(reportErrorSpy).toHaveBeenCalledWith(testError, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context:
                        'Error during store website questions fetching (multiple)',
                },
            })
        })

        it('should handle multiple query errors', async () => {
            const error1 = new Error('API Error 1')
            const error2 = new Error('API Error 2')

            listIngestedResourcesSpy
                .mockRejectedValueOnce(error1)
                .mockRejectedValueOnce(error2)

            const { result } = renderUseMultipleStoreWebsiteQuestions([
                HELP_CENTER_ID_1,
                HELP_CENTER_ID_2,
            ])

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(reportErrorSpy).toHaveBeenCalledTimes(2)
            expect(reportErrorSpy).toHaveBeenCalledWith(
                error1,
                expect.any(Object),
            )
            expect(reportErrorSpy).toHaveBeenCalledWith(
                error2,
                expect.any(Object),
            )
        })
    })

    describe('edge cases', () => {
        it('should handle empty snippetHelpCenterIds array', () => {
            const { result } = renderUseMultipleStoreWebsiteQuestions([])

            expect(result.current.isLoading).toBe(false)
            expect(result.current.storeWebsiteQuestions).toEqual([])
            expect(listIngestedResourcesSpy).not.toHaveBeenCalled()
        })

        it('should handle missing shop data in ingestion logs', () => {
            mockedUseStoresDomainIngestionLogs.mockReturnValue({
                data: {},
                isLoading: false,
            })

            const { result } = renderUseMultipleStoreWebsiteQuestions()

            expect(result.current.storeWebsiteQuestions).toEqual([])
        })

        it('should get latest ingestion log when multiple exist', async () => {
            mockedUseStoresDomainIngestionLogs.mockReturnValue({
                data: {
                    [SHOP_NAME]: [
                        {
                            id: INGESTION_LOG_ID_1,
                            status: 'SUCCESSFUL',
                            created_datetime: '2023-01-01T00:00:00Z',
                            source: 'domain',
                            url: `https://${SHOP_NAME}.myshopify.com`,
                            latest_sync: '2023-01-01T00:00:00Z',
                        } as any,
                        {
                            id: INGESTION_LOG_ID_2,
                            status: 'SUCCESSFUL',
                            created_datetime: '2023-01-02T00:00:00Z',
                            source: 'domain',
                            url: `https://${SHOP_NAME}.myshopify.com`,
                            latest_sync: '2023-01-02T00:00:00Z',
                        } as any,
                    ],
                },
                isLoading: false,
            })

            const { result } = renderUseMultipleStoreWebsiteQuestions()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(listIngestedResourcesSpy).toHaveBeenCalledWith(
                sdkMocks.client,
                {
                    help_center_id: HELP_CENTER_ID_1,
                    article_ingestion_log_id: INGESTION_LOG_ID_2, // Changed from INGESTION_LOG_ID_1 to INGESTION_LOG_ID_2
                },
                {
                    page: 1,
                    per_page: 1000,
                },
            )
        })

        it('should handle resources with complex web_pages structure', async () => {
            const resourceWithComplexWebPages = mockIngestedResourceDto({
                id: 1,
                title: 'Complex Resource',
                web_pages: [
                    {
                        url: 'https://example.com/product1',
                        title: 'Product 1',
                        pageType: 'PRODUCT',
                        description: 'A great product',
                        price: '$10.00',
                    },
                    {
                        url: 'https://example.com/product2',
                        title: 'Product 2',
                        pageType: 'COLLECTION',
                        description: 'Another great product',
                        category: 'Electronics',
                    },
                ] as any,
            })

            listIngestedResourcesSpy.mockResolvedValue(
                mockIngestedResourceResponse([resourceWithComplexWebPages]),
            )

            const { result } = renderUseMultipleStoreWebsiteQuestions()

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions[0].web_pages).toEqual([
                {
                    url: 'https://example.com/product1',
                    title: 'Product 1',
                    pageType: 'PRODUCT',
                },
                {
                    url: 'https://example.com/product2',
                    title: 'Product 2',
                    pageType: 'COLLECTION',
                },
            ])
        })
    })
})
