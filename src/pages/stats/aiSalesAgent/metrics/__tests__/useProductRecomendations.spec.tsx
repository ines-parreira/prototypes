import React from 'react'

import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import { fromJS } from 'immutable'
import moment from 'moment'
import { Provider } from 'react-redux'

import { Product } from 'constants/integrations/types/shopify'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { StatsFilters } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, mockStore } from 'utils/testing'

import { useProductRecommendations } from '../useProductRecommendations'

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

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

jest.mock('models/integration/queries')
const useGetProductsByIdsFromIntegrationMock = assumeMock(
    useGetProductsByIdsFromIntegration,
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

    beforeEach(() => {
        useMetricPerDimensionMock.mockReturnValue({
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

    describe('useProductRecommendations', () => {
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
})
