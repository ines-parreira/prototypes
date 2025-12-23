import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { getMockData } from 'domains/reporting/hooks/automate/test/useAutomationDataset.spec'
import {
    fetchBillableTicketDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'domains/reporting/hooks/automate/timeSeries'
import {
    fetchAIAgentAutomationRateTimeSeriesData,
    useAIAgentAutomationRateTimeSeriesData,
} from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTimeSeriesData'
import {
    fetchTimeSeries,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import type { TimeSeriesResult } from 'domains/reporting/hooks/useTimeSeries'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AUTOMATION_RATE_LABEL } from 'pages/automate/automate-metrics/constants'

jest.mock('domains/reporting/hooks/useTimeSeries')
jest.mock('domains/reporting/hooks/automate/timeSeries')

const useTimeSeriesMock = assumeMock(useTimeSeries)
const useBillableTicketDatasetTimeSeriesMock = assumeMock(
    useBillableTicketDatasetTimeSeries,
)
const fetchTimeSeriesMock = assumeMock(fetchTimeSeries)
const fetchBillableTicketDatasetTimeSeriesMock = assumeMock(
    fetchBillableTicketDatasetTimeSeries,
)

describe('useAIAgentAutomationRateTimeSeriesData', () => {
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
    const timezone = 'UTC'
    const granularity = ReportingGranularity.Day
    const aiAgentInteractionsTimeSeries = [
        getMockData([2, 3, 7]),
        getMockData(
            [0, 1, 1],
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
        ),
    ]
    const billableTicketDatasetTimeSeries = [
        getMockData(
            [1, 2, 6],
            BillableTicketDatasetMeasure.BillableTicketCount,
        ),
    ]
    const expectedResult = [
        [
            {
                dateTime: expect.any(String),
                value: 0.6666666666666666,
                label: AUTOMATION_RATE_LABEL,
            },
            {
                dateTime: expect.any(String),
                value: 0.75,
                label: AUTOMATION_RATE_LABEL,
            },
            {
                dateTime: expect.any(String),
                value: 0.5833333333333334,
                label: AUTOMATION_RATE_LABEL,
            },
        ],
    ]

    describe('useAIAgentAutomationRateTimeSeriesData', () => {
        beforeEach(() => {
            useTimeSeriesMock.mockReturnValue({
                data: aiAgentInteractionsTimeSeries,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as TimeSeriesResult)
            useBillableTicketDatasetTimeSeriesMock.mockReturnValue({
                data: billableTicketDatasetTimeSeries,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as TimeSeriesResult)
        })

        it('should fetch and format AI Agent automation rate data', () => {
            const { result } = renderHook(() =>
                useAIAgentAutomationRateTimeSeriesData(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )

            expect(result.current).toEqual({
                data: expectedResult,
                isError: false,
                isFetching: false,
            })
        })

        it('should return loading state when data is fetching', () => {
            useTimeSeriesMock.mockReturnValue({
                data: [[]],
                isFetched: false,
                isFetching: true,
                isError: false,
            } as unknown as TimeSeriesResult)

            const { result } = renderHook(() =>
                useAIAgentAutomationRateTimeSeriesData(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )

            expect(result.current).toEqual({
                data: [[]],
                isFetching: true,
                isError: false,
            })
        })

        it('should return error state when data fetching fails', () => {
            useTimeSeriesMock.mockReturnValue({
                data: [[]],
                isFetched: true,
                isFetching: false,
                isError: true,
            } as unknown as TimeSeriesResult)

            const { result } = renderHook(() =>
                useAIAgentAutomationRateTimeSeriesData(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )

            expect(result.current).toEqual({
                data: [[]],
                isFetching: false,
                isError: true,
            })
        })

        it('should handle empty data arrays', () => {
            useTimeSeriesMock.mockReturnValue({
                data: [[]],
                isFetched: true,
                isFetching: false,
                isError: false,
            } as unknown as TimeSeriesResult)
            useBillableTicketDatasetTimeSeriesMock.mockReturnValue({
                data: [[]],
                isFetched: true,
                isFetching: false,
                isError: false,
            } as unknown as TimeSeriesResult)

            const { result } = renderHook(() =>
                useAIAgentAutomationRateTimeSeriesData(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )

            expect(result.current).toEqual({
                data: [[]],
                isFetching: false,
                isError: false,
            })
        })

        it('should use unfiltered denominator in automation rate calculation', () => {
            const { result } = renderHook(() =>
                useAIAgentAutomationRateTimeSeriesData(
                    statsFilters,
                    timezone,
                    granularity,
                ),
            )

            expect(result.current).toEqual({
                data: expectedResult,
                isError: false,
                isFetching: false,
            })
        })
    })

    describe('fetchAIAgentAutomationRateTimeSeriesData', () => {
        beforeEach(() => {
            fetchTimeSeriesMock.mockResolvedValue(
                aiAgentInteractionsTimeSeries as any,
            )
            fetchBillableTicketDatasetTimeSeriesMock.mockResolvedValue(
                billableTicketDatasetTimeSeries as any,
            )
        })

        it('should fetch and format AI Agent automation rate data', async () => {
            const result = await fetchAIAgentAutomationRateTimeSeriesData(
                statsFilters,
                timezone,
                granularity,
                undefined,
            )

            expect(result).toEqual({
                data: expectedResult,
                isError: false,
                isFetching: false,
            })
        })

        it('should return empty data when no data is received', async () => {
            fetchTimeSeriesMock.mockResolvedValue([[]])
            fetchBillableTicketDatasetTimeSeriesMock.mockResolvedValue([[]])

            const result = await fetchAIAgentAutomationRateTimeSeriesData(
                statsFilters,
                timezone,
                granularity,
                undefined,
            )

            expect(result).toEqual({
                data: [[]],
                isError: false,
                isFetching: false,
            })
        })

        it('should use unfiltered denominator in automation rate calculation', async () => {
            const result = await fetchAIAgentAutomationRateTimeSeriesData(
                statsFilters,
                timezone,
                granularity,
                undefined,
            )

            expect(result).toEqual({
                data: expectedResult,
                isError: false,
                isFetching: false,
            })
        })

        it('should handle missing billable ticket data', async () => {
            fetchBillableTicketDatasetTimeSeriesMock.mockResolvedValue([[]])

            const result = await fetchAIAgentAutomationRateTimeSeriesData(
                statsFilters,
                timezone,
                granularity,
                undefined,
            )

            expect(result).toEqual({
                data: [[]],
                isError: false,
                isFetching: false,
            })
        })

        it('should handle missing AI Agent interactions data', async () => {
            fetchTimeSeriesMock.mockResolvedValue([[]])

            const result = await fetchAIAgentAutomationRateTimeSeriesData(
                statsFilters,
                timezone,
                granularity,
                undefined,
            )

            expect(result).toEqual({
                data: [[]],
                isError: false,
                isFetching: false,
            })
        })
    })
})
