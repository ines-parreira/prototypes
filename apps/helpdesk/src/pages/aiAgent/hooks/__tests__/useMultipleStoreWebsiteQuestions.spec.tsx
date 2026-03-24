import type React from 'react'

import { reportError } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import * as resources from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { buildSDKMocks } from 'rest_api/help_center_api/tests/buildSdkMocks'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useMultipleStoreWebsiteQuestions } from '../useMultipleStoreWebsiteQuestions'
import { useStoresDomainIngestionLogs } from '../useStoresDomainIngestionLogs'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
jest.mock('../useStoresDomainIngestionLogs')
jest.mock('models/helpCenter/resources')
jest.mock('@repo/logging')

const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>
const mockedUseStoresDomainIngestionLogs =
    useStoresDomainIngestionLogs as jest.MockedFunction<
        typeof useStoresDomainIngestionLogs
    >
const listIngestedResourcesSpy = jest.spyOn(resources, 'listIngestedResources')
const mockedReportError = jest.mocked(reportError)

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
            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

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
                    per_page: 100,
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

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1, HELP_CENTER_ID_2],
                SHOP_NAME,
                { enabled: true },
            )

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

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

            expect(result.current.isLoading).toBe(true)
            expect(result.current.storeWebsiteQuestions).toEqual([])
        })

        it('should return loading true initially', () => {
            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

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

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(mockedReportError).toHaveBeenCalledWith(testError, {
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

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1, HELP_CENTER_ID_2],
                SHOP_NAME,
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(mockedReportError).toHaveBeenCalledTimes(2)
            expect(mockedReportError).toHaveBeenCalledWith(
                error1,
                expect.any(Object),
            )
            expect(mockedReportError).toHaveBeenCalledWith(
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

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

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
                    per_page: 100,
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

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

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

        it('should handle multi-page results correctly', async () => {
            const page1Resources = [
                mockIngestedResourceDto({
                    id: 1,
                    title: 'Page 1 Resource 1',
                    article_id: 101,
                }),
                mockIngestedResourceDto({
                    id: 2,
                    title: 'Page 1 Resource 2',
                    article_id: 102,
                }),
            ]
            const page2Resources = [
                mockIngestedResourceDto({
                    id: 3,
                    title: 'Page 2 Resource 1',
                    article_id: 103,
                }),
                mockIngestedResourceDto({
                    id: 4,
                    title: 'Page 2 Resource 2',
                    article_id: 104,
                }),
            ]
            const page3Resources = [
                mockIngestedResourceDto({
                    id: 5,
                    title: 'Page 3 Resource 1',
                    article_id: 105,
                }),
            ]

            listIngestedResourcesSpy
                .mockResolvedValueOnce({
                    data: page1Resources,
                    object: 'list',
                    meta: {
                        page: 1,
                        per_page: 100,
                        current_page: '/ingested-resources?page=1',
                        item_count: 5,
                        nb_pages: 3,
                    },
                })
                .mockResolvedValueOnce({
                    data: page2Resources,
                    object: 'list',
                    meta: {
                        page: 2,
                        per_page: 100,
                        current_page: '/ingested-resources?page=2',
                        item_count: 5,
                        nb_pages: 3,
                    },
                })
                .mockResolvedValueOnce({
                    data: page3Resources,
                    object: 'list',
                    meta: {
                        page: 3,
                        per_page: 100,
                        current_page: '/ingested-resources?page=3',
                        item_count: 5,
                        nb_pages: 3,
                    },
                })

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toHaveLength(5)
            expect(
                result.current.storeWebsiteQuestions.map((r) => r.title),
            ).toEqual([
                'Page 1 Resource 1',
                'Page 1 Resource 2',
                'Page 2 Resource 1',
                'Page 2 Resource 2',
                'Page 3 Resource 1',
            ])

            expect(listIngestedResourcesSpy).toHaveBeenCalledTimes(3)
            expect(listIngestedResourcesSpy).toHaveBeenNthCalledWith(
                1,
                sdkMocks.client,
                {
                    help_center_id: HELP_CENTER_ID_1,
                    article_ingestion_log_id: INGESTION_LOG_ID_1,
                },
                { page: 1, per_page: 100 },
            )
            expect(listIngestedResourcesSpy).toHaveBeenNthCalledWith(
                2,
                sdkMocks.client,
                {
                    help_center_id: HELP_CENTER_ID_1,
                    article_ingestion_log_id: INGESTION_LOG_ID_1,
                },
                { page: 2, per_page: 100 },
            )
            expect(listIngestedResourcesSpy).toHaveBeenNthCalledWith(
                3,
                sdkMocks.client,
                {
                    help_center_id: HELP_CENTER_ID_1,
                    article_ingestion_log_id: INGESTION_LOG_ID_1,
                },
                { page: 3, per_page: 100 },
            )
        })

        it('should filter by recordIds across multiple pages', async () => {
            const page1Resources = [
                mockIngestedResourceDto({
                    id: 1,
                    title: 'Resource 1',
                    article_id: 101,
                }),
                mockIngestedResourceDto({
                    id: 2,
                    title: 'Resource 2',
                    article_id: 102,
                }),
                mockIngestedResourceDto({
                    id: 3,
                    title: 'Resource 3',
                    article_id: 103,
                }),
            ]
            const page2Resources = [
                mockIngestedResourceDto({
                    id: 4,
                    title: 'Resource 4',
                    article_id: 104,
                }),
                mockIngestedResourceDto({
                    id: 5,
                    title: 'Resource 5',
                    article_id: 105,
                }),
                mockIngestedResourceDto({
                    id: 6,
                    title: 'Resource 6',
                    article_id: 106,
                }),
            ]

            listIngestedResourcesSpy
                .mockResolvedValueOnce({
                    data: page1Resources,
                    object: 'list',
                    meta: {
                        page: 1,
                        per_page: 100,
                        current_page: '/ingested-resources?page=1',
                        item_count: 6,
                        nb_pages: 2,
                    },
                })
                .mockResolvedValueOnce({
                    data: page2Resources,
                    object: 'list',
                    meta: {
                        page: 2,
                        per_page: 100,
                        current_page: '/ingested-resources?page=2',
                        item_count: 6,
                        nb_pages: 2,
                    },
                })

            const { result } = renderHook(
                () =>
                    useMultipleStoreWebsiteQuestions({
                        snippetHelpCenterIds: [HELP_CENTER_ID_1],
                        recordIds: [101, 104, 106],
                        shopName: SHOP_NAME,
                        queryOptionsOverrides: { enabled: true },
                    }),
                {
                    wrapper: ({ children }: { children?: React.ReactNode }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toHaveLength(3)
            expect(
                result.current.storeWebsiteQuestions.map((r) => r.title),
            ).toEqual(['Resource 1', 'Resource 4', 'Resource 6'])
        })

        it('should handle multiple help centers with multi-page results', async () => {
            const hc1Page1 = [
                mockIngestedResourceDto({
                    id: 1,
                    title: 'HC1 P1 R1',
                    article_id: 101,
                }),
            ]
            const hc1Page2 = [
                mockIngestedResourceDto({
                    id: 2,
                    title: 'HC1 P2 R1',
                    article_id: 102,
                }),
            ]
            const hc2Page1 = [
                mockIngestedResourceDto({
                    id: 3,
                    title: 'HC2 P1 R1',
                    article_id: 201,
                }),
            ]
            const hc2Page2 = [
                mockIngestedResourceDto({
                    id: 4,
                    title: 'HC2 P2 R1',
                    article_id: 202,
                }),
            ]

            listIngestedResourcesSpy
                .mockResolvedValueOnce({
                    data: hc1Page1,
                    object: 'list',
                    meta: {
                        page: 1,
                        per_page: 100,
                        current_page: '/ingested-resources?page=1',
                        item_count: 2,
                        nb_pages: 2,
                    },
                })
                .mockResolvedValueOnce({
                    data: hc2Page1,
                    object: 'list',
                    meta: {
                        page: 1,
                        per_page: 100,
                        current_page: '/ingested-resources?page=1',
                        item_count: 2,
                        nb_pages: 2,
                    },
                })
                .mockResolvedValueOnce({
                    data: hc1Page2,
                    object: 'list',
                    meta: {
                        page: 2,
                        per_page: 100,
                        current_page: '/ingested-resources?page=2',
                        item_count: 2,
                        nb_pages: 2,
                    },
                })
                .mockResolvedValueOnce({
                    data: hc2Page2,
                    object: 'list',
                    meta: {
                        page: 2,
                        per_page: 100,
                        current_page: '/ingested-resources?page=2',
                        item_count: 2,
                        nb_pages: 2,
                    },
                })

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1, HELP_CENTER_ID_2],
                SHOP_NAME,
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toHaveLength(4)
            expect(
                result.current.storeWebsiteQuestions.map((r) => ({
                    title: r.title,
                    hcId: r.helpCenterId,
                })),
            ).toEqual([
                { title: 'HC1 P1 R1', hcId: HELP_CENTER_ID_1 },
                { title: 'HC2 P1 R1', hcId: HELP_CENTER_ID_2 },
                { title: 'HC1 P2 R1', hcId: HELP_CENTER_ID_1 },
                { title: 'HC2 P2 R1', hcId: HELP_CENTER_ID_2 },
            ])

            expect(listIngestedResourcesSpy).toHaveBeenCalledTimes(4)
        })

        it('should handle null additional page query data', async () => {
            listIngestedResourcesSpy
                .mockResolvedValueOnce({
                    data: [
                        mockIngestedResourceDto({
                            id: 1,
                            title: 'Page 1 Resource',
                            article_id: 101,
                        }),
                    ],
                    object: 'list',
                    meta: {
                        page: 1,
                        per_page: 100,
                        current_page: '/ingested-resources?page=1',
                        item_count: 2,
                        nb_pages: 2,
                    },
                })
                .mockResolvedValueOnce(null)

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toHaveLength(1)
            expect(result.current.storeWebsiteQuestions[0].title).toBe(
                'Page 1 Resource',
            )
        })

        it('should handle empty additional page data', async () => {
            listIngestedResourcesSpy
                .mockResolvedValueOnce({
                    data: [
                        mockIngestedResourceDto({
                            id: 1,
                            title: 'Page 1 Resource',
                            article_id: 101,
                        }),
                    ],
                    object: 'list',
                    meta: {
                        page: 1,
                        per_page: 100,
                        current_page: '/ingested-resources?page=1',
                        item_count: 1,
                        nb_pages: 2,
                    },
                })
                .mockResolvedValueOnce({
                    data: [],
                    object: 'list',
                    meta: {
                        page: 2,
                        per_page: 100,
                        current_page: '/ingested-resources?page=2',
                        item_count: 1,
                        nb_pages: 2,
                    },
                })

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toHaveLength(1)
            expect(result.current.storeWebsiteQuestions[0].title).toBe(
                'Page 1 Resource',
            )
        })

        it('should handle missing ingestionLogId in additional page queries', async () => {
            mockedUseStoresDomainIngestionLogs.mockReturnValue({
                data: {
                    [SHOP_NAME]: [],
                },
                isLoading: false,
            })

            listIngestedResourcesSpy.mockResolvedValueOnce({
                data: [
                    mockIngestedResourceDto({
                        id: 1,
                        title: 'Resource',
                        article_id: 101,
                    }),
                ],
                object: 'list',
                meta: {
                    page: 1,
                    per_page: 100,
                    current_page: '/ingested-resources?page=1',
                    item_count: 2,
                    nb_pages: 2,
                },
            })

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toEqual([])
        })

        it('should handle when queryOptionsOverrides is disabled during loading check', () => {
            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: false },
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.storeWebsiteQuestions).toEqual([])
        })

        it('should handle early return in additional page queries when missing data', async () => {
            listIngestedResourcesSpy
                .mockResolvedValueOnce({
                    data: [
                        mockIngestedResourceDto({
                            id: 1,
                            title: 'Resource',
                            article_id: 101,
                        }),
                    ],
                    object: 'list',
                    meta: {
                        page: 1,
                        per_page: 100,
                        current_page: '/ingested-resources?page=1',
                        item_count: 2,
                        nb_pages: 2,
                    },
                })
                .mockImplementationOnce(() => {
                    throw new Error('Implementation should not be called')
                })

            mockedUseStoresDomainIngestionLogs.mockReturnValue({
                data: {
                    [SHOP_NAME]: [],
                },
                isLoading: false,
            })

            const { result } = renderUseMultipleStoreWebsiteQuestions(
                [HELP_CENTER_ID_1],
                SHOP_NAME,
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.storeWebsiteQuestions).toEqual([])
        })
    })
})
