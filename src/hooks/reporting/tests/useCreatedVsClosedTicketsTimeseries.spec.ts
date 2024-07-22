import {renderHook} from '@testing-library/react-hooks'
import {UseQueryResult} from '@tanstack/react-query'
import useAppSelector from 'hooks/useAppSelector'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import {useCreatedVsClosedTicketsTimeSeries} from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'
import {
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {periodToReportingGranularity} from 'utils/reporting'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {assumeMock} from 'utils/testing'
import {ReportingGranularity} from 'models/reporting/types'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {TimeSeriesDataItem} from '../useTimeSeries'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('hooks/reporting/timeSeries')
const mockedUseTicketsClosedTimeSeries = assumeMock(useTicketsClosedTimeSeries)
const mockedUseTicketsCreatedTimeSeries = assumeMock(
    useTicketsCreatedTimeSeries
)
jest.mock('hooks/reporting/useCleanStatsFilters')
const mockedUseCleanStatsFilters = assumeMock(useCleanStatsFilters)

jest.mock('pages/stats/common/utils')
const mockedFormatTimeSeriesData = assumeMock(formatTimeSeriesData)

jest.mock('utils/reporting')
const mockedPeriodToReportingGranularity = assumeMock(
    periodToReportingGranularity
)

jest.mock('state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)

describe('useCreatedVsClosedTicketsTimeSeries', () => {
    const mockGranularity = ReportingGranularity.Month

    const mockTimezone = 'UTC'
    const mockFilters = {
        period: {start_datetime: '2023-01-01', end_datetime: '2023-02-01'},
    }
    const mockClosedData = [
        [{dateTime: '2023-01-01', value: 10, label: 'closed'}],
    ]
    const mockCreatedData = [
        [{dateTime: '2023-01-01', value: 15, label: 'created'}],
    ]
    const mockTimeSeriesData = [
        {
            label: 'exampleLabel',
            values: [{x: 'exampleX', y: 123}],
        },
    ]

    beforeEach(() => {
        jest.resetAllMocks()

        mockedUseCleanStatsFilters.mockReturnValue(mockFilters)
        mockedUseTicketsClosedTimeSeries.mockReturnValue({
            data: mockClosedData,
            isLoading: false,
            isError: false,
        } as UseQueryResult<TimeSeriesDataItem[][]>)
        mockedUseTicketsCreatedTimeSeries.mockReturnValue({
            data: mockCreatedData,
            isLoading: false,
            isError: false,
        } as UseQueryResult<TimeSeriesDataItem[][]>)
        mockedFormatTimeSeriesData.mockReturnValue(mockTimeSeriesData)
        mockedPeriodToReportingGranularity.mockReturnValue(mockGranularity)
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            cleanStatsFilters: mockFilters,
            userTimezone: mockTimezone,
            granularity: mockGranularity,
        })

        useAppSelectorMock.mockReturnValue({
            cleanStatsFilters: mockFilters,
            userTimezone: mockTimezone,
            granularity: mockGranularity,
        })
    })

    it('should return formatted time series for closed and created tickets', () => {
        const {result} = renderHook(() => useCreatedVsClosedTicketsTimeSeries())

        expect(result.current).toEqual(
            expect.objectContaining({
                timeSeries: [...mockTimeSeriesData, ...mockTimeSeriesData],
                isLoading: false,
            })
        )
        expect(mockedFormatTimeSeriesData).toHaveBeenCalledTimes(2)
        expect(mockedUseTicketsClosedTimeSeries).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            mockGranularity
        )
        expect(mockedUseTicketsCreatedTimeSeries).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            mockGranularity
        )
    })
})
