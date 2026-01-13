import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { shopifyIntegration } from 'fixtures/integrations'
import useAppSelector from 'hooks/useAppSelector'

import { useTopLocations } from '../useTopLocations'

jest.mock('hooks/useAppSelector')
jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock('domains/reporting/hooks/useMetric')

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseMetricPerDimension = useMetricPerDimension as jest.Mock
const mockUseMetric = useMetric as jest.Mock

describe('useTopLocations', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return enriched top location data with percentage', () => {
        mockUseAppSelector.mockReturnValue(fromJS(shopifyIntegration))

        mockUseMetricPerDimension.mockReturnValue({
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.ShippingCity]:
                            'Los Angeles',
                        [AiSalesAgentOrdersMeasure.Count]: '100',
                    },
                    {
                        [AiSalesAgentOrdersDimension.ShippingCity]: 'New York',
                        [AiSalesAgentOrdersMeasure.Count]: '50',
                    },
                ],
            },
            isFetching: false,
        })

        mockUseMetric.mockReturnValue({
            data: {
                value: '200',
            },
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useTopLocations({ shopName: shopifyIntegration.meta.shop_name }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual([
            {
                percentage: 50,
                id: 'Los Angeles',
                title: 'Los Angeles',
            },
            {
                percentage: 25,
                id: 'New York',
                title: 'New York',
            },
        ])
    })

    it('should return loading true if any query is fetching', () => {
        mockUseAppSelector.mockReturnValue(fromJS(shopifyIntegration))

        mockUseMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
        })

        mockUseMetric.mockReturnValue({
            data: null,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useTopLocations({ shopName: shopifyIntegration.meta.shop_name }),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return percentage 0 if total count is 0', () => {
        mockUseAppSelector.mockReturnValue(fromJS(shopifyIntegration))

        mockUseMetricPerDimension.mockReturnValue({
            data: {
                allData: [
                    {
                        [AiSalesAgentOrdersDimension.ShippingCity]: 'Chicago',
                        [AiSalesAgentOrdersMeasure.Count]: '100',
                    },
                ],
            },
            isFetching: false,
        })

        mockUseMetric.mockReturnValue({
            data: {
                value: '0',
            },
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useTopLocations({ shopName: shopifyIntegration.meta.shop_name }),
        )

        expect(result.current.data[0].percentage).toBe(0)
    })
})
