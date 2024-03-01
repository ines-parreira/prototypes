import {renderHook} from '@testing-library/react-hooks'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'
import {useOneTouchTicketsPercentageMetricTrend} from 'hooks/reporting/useOneTouchTicketsPercentageMetricTrend'
import {
    useClosedTicketsTrend,
    useOneTouchTicketsTrend,
} from 'hooks/reporting/metricTrends'

jest.mock('hooks/reporting/metricTrends')
const mockUseOneTicketsTrend = assumeMock(useOneTouchTicketsTrend)
const mockUseClosedTicketsTrend = assumeMock(useClosedTicketsTrend)

describe('useOneTouchTicketsPercentageMetric', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: '2020-01-01',
            start_datetime: '2020-01-01',
        },
    }
    const timezone = 'America/New_York'

    it('should calculate percentages correctly', () => {
        const mockData = {
            data: {value: 50, prevValue: 30},
            isFetching: false,
            isError: false,
        }
        const mockClosedTicketsPerAgent = {
            data: {value: 200, prevValue: 100},
            isFetching: false,
            isError: false,
        }

        mockUseOneTicketsTrend.mockImplementationOnce(() => mockData)
        mockUseClosedTicketsTrend.mockImplementationOnce(
            () => mockClosedTicketsPerAgent
        )

        const {result} = renderHook(() =>
            useOneTouchTicketsPercentageMetricTrend(statsFilters, timezone)
        )

        expect(result?.current?.data?.value).toBe(25)
        expect(result?.current?.data?.prevValue).toBe(30)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return null on missing data', () => {
        const mockData = {
            data: undefined,
            isFetching: false,
            isError: false,
        }
        const mockClosedTicketsPerAgent = {
            data: undefined,
            isFetching: false,
            isError: false,
        }

        mockUseOneTicketsTrend.mockImplementationOnce(() => mockData)
        mockUseClosedTicketsTrend.mockImplementationOnce(
            () => mockClosedTicketsPerAgent
        )

        const {result} = renderHook(() =>
            useOneTouchTicketsPercentageMetricTrend(statsFilters, timezone)
        )

        expect(result?.current?.data?.value).toBe(undefined)
        expect(result?.current?.data?.prevValue).toBe(undefined)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
    })
})
