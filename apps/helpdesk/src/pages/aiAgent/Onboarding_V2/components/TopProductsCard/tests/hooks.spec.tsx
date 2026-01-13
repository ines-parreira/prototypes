import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import moment from 'moment'

import type { Product } from 'constants/integrations/types/shopify'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import useTopProducts from '../hooks'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock('models/integration/queries')

const mockUseMetricPerDimension = assumeMock(useMetricPerDimension)
const mockUseGetProductsByIdsFromIntegration = assumeMock(
    useGetProductsByIdsFromIntegration,
)
const queryClient = mockQueryClient()

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

const filters: StatsFilters = {
    period: {
        start_datetime: moment().subtract(1, 'month').startOf('day').format(),
        end_datetime: moment().endOf('day').format(),
    },
    storeIntegrations: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [1],
    },
}

describe('useTopProducts', () => {
    const hookWrapper = ({ children }: any) => {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return data', async () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: {
                decile: null,
                value: null,
                allData: [],
                dimensions: [AiSalesAgentOrdersDimension.ProductId],
                measures: [AiSalesAgentOrdersMeasure.Count],
            },
            isFetching: true,
            isError: false,
        })
        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            isFetching: true,
            isError: false,
            data: [],
        } as unknown as UseQueryResult<Product[]>)
    })

    it('should return isLoading true when fetching data', async () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: {
                decile: null,
                value: null,
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.ProductId]: '1',
                        [AiSalesAgentOrdersMeasure.Count]: '100',
                    },
                ],
            },
            isFetching: false,
            isError: false,
        })
        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            isFetching: false,
            isError: false,
            data: [product],
        } as unknown as UseQueryResult<Product[]>)

        const { result } = renderHook(
            () => useTopProducts({ filters, timezone: 'UTC', currency: 'USD' }),
            {
                wrapper: hookWrapper,
            },
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                data: [
                    {
                        currency: 'USD',
                        description: '100 sales',
                        featuredImage: undefined,
                        id: 1,
                        price: undefined,
                        title: 'Product 1',
                    },
                ],
                isLoading: false,
            })
        })
    })
})
