import { renderHook as reactRenderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import { AiSalesAgentOrderCustomersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import { StatsFilters } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { assumeMock, mockStore } from 'utils/testing'

import { useGetRepeatRate } from '../useGetRepeatRate'

const store = mockStore({})

jest.mock('hooks/reporting/useMetricPerDimension')
const mockUseMetricPerDimension = assumeMock(useMetricPerDimension)

const filters: StatsFilters = {
    period: {
        start_datetime: '2021-01-01T00:00:00Z',
        end_datetime: '2021-01-02T00:00:00Z',
    },
    storeIntegrations: {
        operator: LogicalOperatorEnum.ONE_OF,
        values: [12345],
    },
}

const renderHook = (hook: typeof useGetRepeatRate) => {
    return reactRenderHook(() => hook(filters, 'UTC'), {
        wrapper: ({ children }) => (
            <Provider store={store}>{children}</Provider>
        ),
    })
}

describe('useGetRepeatRate', () => {
    it('should return 0 if it is fetching', () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        } as any)

        const { result } = renderHook(() => useGetRepeatRate(filters, 'UTC'))

        expect(result.current.data).toEqual(0)
    })

    it('should return 0 if it has an error', () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: true,
        } as any)

        const { result } = renderHook(() => useGetRepeatRate(filters, 'UTC'))

        expect(result.current.data).toEqual(0)
    })

    it('should return 0 if there is no data', () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useGetRepeatRate(filters, 'UTC'))

        expect(result.current.data).toEqual(0)
    })

    it('should return 0 if allData is empty', () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: {
                allData: [],
            },
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useGetRepeatRate(filters, 'UTC'))

        expect(result.current.data).toEqual(0)
    })

    it('should return averageOrdersValue if correctly returned by query', () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: {
                allData: [
                    {
                        [AiSalesAgentOrderCustomersMeasure.RecurringCount]: 100,
                        [AiSalesAgentOrderCustomersMeasure.Count]: 10,
                    },
                ],
            },
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() => useGetRepeatRate(filters, 'UTC'))

        expect(result.current.data).toEqual(10)
    })
})
