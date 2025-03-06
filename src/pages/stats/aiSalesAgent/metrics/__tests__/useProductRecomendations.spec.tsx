import React from 'react'

import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import moment from 'moment'

import { Product } from 'constants/integrations/types/shopify'
import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { StatsFilters } from 'models/stat/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

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
}

const queryClient = mockQueryClient()

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

jest.mock('models/integration/queries')
const useGetProductsByIdsFromIntegrationMock = assumeMock(
    useGetProductsByIdsFromIntegration,
)

jest.useFakeTimers()

describe('productRecommendations', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult
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

    describe('useProductRecommendations', () => {
        it('should return correct metric data when the query resolves', async () => {
            useMetricPerDimensionMock.mockReturnValue({
                ...defaultReporting,
                data: {
                    value: null,
                    decile: null,
                    allData: [
                        {
                            [AiSalesAgentConversationsDimension.ProductId]: '1',
                            [AiSalesAgentConversationsMeasure.Count]: '100',
                        },
                    ],
                },
            })
            useGetProductsByIdsFromIntegrationMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: [product],
            } as unknown as UseQueryResult<Product[]>)

            act(() => jest.runAllTimers())

            const { result } = renderHook(
                () => useProductRecommendations(statsFilters, timezone),
                {
                    wrapper: ({ children }) => (
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    ),
                },
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    data: [
                        {
                            product: product,
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
