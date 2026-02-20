import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment'
import { Provider } from 'react-redux'

import type { Product } from 'constants/integrations/types/shopify'
import {
    fetchMetricPerDimension,
    fetchMetricPerDimensionV2,
    useMetricPerDimension,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    ConvertTrackingEventsDimension,
    ConvertTrackingEventsMeasure,
} from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchProductRecommendations,
    useProductRecommendations,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductRecommendations'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { fetchIntegrationProducts as fetchIntegrationProductsByIds } from 'state/integrations/helpers'
import type { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

const timezone = 'UTC'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: moment()
            .add(1 * 7, 'day')
            .format('YYYY-MM-DDT00:00:00.000'),
        end_datetime: moment()
            .add(3 * 7, 'day')
            .format('YYYY-MM-DDT23:50:59.999'),
    },
    storeIntegrations: {
        values: [shopifyIntegration.id],
        operator: LogicalOperatorEnum.ONE_OF,
    },
}

const queryClient = mockQueryClient()

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

jest.mock('models/integration/queries')
const useGetProductsByIdsFromIntegrationMock = assumeMock(
    useGetProductsByIdsFromIntegration,
)

jest.mock('state/integrations/helpers')
const mockFetchIntegrationProductsByIds = assumeMock(
    fetchIntegrationProductsByIds,
)

jest.useFakeTimers()

const defaultState = {
    integrations: fromJS(integrationsState).mergeDeep({
        integrations: [shopifyIntegration],
    }),
} as RootState

describe('productRecommendations', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const exampleMetricData = {
        value: null,
        decile: null,
        allData: [
            {
                [AiSalesAgentConversationsDimension.ProductId]: '1',
                [AiSalesAgentConversationsMeasure.Count]: '100',
            },
        ],
    }

    const product = {
        id: 1,
        title: `Product 1`,
        handle: `product-1`,
        image: null,
        created_at: new Date().toISOString(),
        variants: [],
        images: [],
        options: [],
    }

    const hookWrapper =
        (state: RootState) =>
        ({ children }: any) => {
            return (
                <Provider store={mockStore(state)}>
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                </Provider>
            )
        }

    describe('useProductRecommendations', () => {
        beforeEach(() => {
            useMetricPerDimensionMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    ...exampleMetricData,
                },
            })
            useMetricPerDimensionV2Mock.mockReturnValue({
                ...defaultReporting,
                data: {
                    ...exampleMetricData,
                },
            })

            useGetProductsByIdsFromIntegrationMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: [product],
            } as unknown as UseQueryResult<Product[]>)

            act(() => jest.runAllTimers())
        })

        it('should return empty `url` if integration is missing', async () => {
            const stateWithoutIntegration = {
                integrations: fromJS(integrationsState).mergeDeep({
                    integrations: [],
                }),
            } as RootState

            const { result } = renderHook(
                () => useProductRecommendations(statsFilters, timezone),
                {
                    wrapper: hookWrapper(stateWithoutIntegration),
                },
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    data: [
                        {
                            product: {
                                ...product,
                                url: '',
                            },
                            metrics: {
                                btr: 0,
                                ctr: 0,
                                recommendations: 100,
                            },
                        },
                    ],
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('should return correct metric data when the query resolves', async () => {
            const { result } = renderHook(
                () => useProductRecommendations(statsFilters, timezone),
                {
                    wrapper: hookWrapper(defaultState),
                },
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    data: [
                        {
                            product: {
                                ...product,
                                url: 'https://shopify.myshopify.com/products/product-1',
                            },
                            metrics: {
                                btr: 0,
                                ctr: 0,
                                recommendations: 100,
                            },
                        },
                    ],
                    isError: false,
                    isFetching: false,
                })
            })
        })

        it('product handle is missing', async () => {
            useMetricPerDimensionMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    ...exampleMetricData,
                },
            })

            useGetProductsByIdsFromIntegrationMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: [{ ...product, handle: '' }],
            } as unknown as UseQueryResult<Product[]>)

            const { result } = renderHook(
                () => useProductRecommendations(statsFilters, timezone),
                {
                    wrapper: hookWrapper(defaultState),
                },
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    data: [
                        {
                            product: {
                                ...product,
                                handle: '',
                                url: '',
                            },
                            metrics: {
                                btr: 0,
                                ctr: 0,
                                recommendations: 100,
                            },
                        },
                    ],
                    isError: false,
                    isFetching: false,
                })
            })
        })
    })

    describe('fetchProductRecommendations', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should fetch and map product recommendations successfully', async () => {
            fetchMetricPerDimensionMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    value: 0,
                    decile: 0,
                    allData: [
                        {
                            [ConvertTrackingEventsDimension.ProductId]: '1',
                            [ConvertTrackingEventsMeasure.UniqClicks]: '50',
                        },
                    ],
                },
            })
            fetchMetricPerDimensionV2Mock
                .mockResolvedValueOnce({
                    isFetching: false,
                    isError: false,
                    data: {
                        value: 0,
                        decile: 0,
                        allData: [
                            {
                                [AiSalesAgentConversationsDimension.ProductId]:
                                    '1',
                                [AiSalesAgentConversationsMeasure.Count]: '100',
                            },
                        ],
                    },
                })
                .mockResolvedValueOnce({
                    isFetching: false,
                    isError: false,
                    data: {
                        value: 0,
                        decile: 0,
                        allData: [
                            {
                                [AiSalesAgentOrdersDimension.InfluencedProductId]:
                                    '1',
                                [AiSalesAgentOrdersMeasure.UniqCount]: '10',
                            },
                        ],
                    },
                })

            mockFetchIntegrationProductsByIds.mockResolvedValue([
                fromJS({
                    ...product,
                    id: 1,
                    name: 'Product 1',
                }),
            ])

            const result = await fetchProductRecommendations(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: [
                    {
                        btr: 0.1,
                        ctr: 0.5,
                        name: 'Product 1',
                        recommendations: 100,
                    },
                ],
                isFetching: false,
                isError: false,
            })
        })

        it('should handle errors gracefully', async () => {
            fetchMetricPerDimensionMock.mockRejectedValue(
                new Error('API Error'),
            )

            const result = await fetchProductRecommendations(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: [],
                isFetching: false,
                isError: true,
            })
        })

        it('should return empty data when no products are found', async () => {
            fetchMetricPerDimensionMock.mockResolvedValue({
                isFetching: false,
                isError: false,
                data: { value: 0, decile: 0, allData: [] },
            })
            fetchMetricPerDimensionV2Mock.mockResolvedValue({
                isFetching: false,
                isError: false,
                data: { value: 0, decile: 0, allData: [] },
            })

            mockFetchIntegrationProductsByIds.mockResolvedValue([])

            const result = await fetchProductRecommendations(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: [],
                isFetching: false,
                isError: false,
            })
        })
    })
})
