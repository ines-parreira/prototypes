import { UseQueryResult } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { mockFlags } from 'jest-launchdarkly-mock'
import moment from 'moment/moment'

import { FeatureFlagKey } from 'config/featureFlags'
import { getMockData } from 'hooks/reporting/automate/test/useAutomationDataset.spec'
import {
    fetchAutomationDatasetTimeSeries,
    fetchBillableTicketDatasetTimeSeries,
    useAutomationDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'hooks/reporting/automate/timeSeries'
import {
    fetchAutomationRateTimeSeriesData,
    useAutomationRateTimeSeriesData,
} from 'hooks/reporting/automate/useAutomationRateTimeSeriesData'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { AutomationDatasetMeasure } from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetMeasure } from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { AUTOMATION_RATE_LABEL } from 'pages/stats/self-service/constants'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/automate/timeSeries')
const useAutomationDatasetTimeSeriesMock = assumeMock(
    useAutomationDatasetTimeSeries,
)
const useBillableTicketDatasetTimeSeriesMock = assumeMock(
    useBillableTicketDatasetTimeSeries,
)
const fetchAutomationDatasetTimeSeriesMock = assumeMock(
    fetchAutomationDatasetTimeSeries,
)
const fetchBillableTicketDatasetTimeSeriesMock = assumeMock(
    fetchBillableTicketDatasetTimeSeries,
)

describe('useAutomationRateTimeSeriesData', () => {
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
    const automationDatasetTimeSeries = [
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
                value: 0.6666666666666666, // 2/(2+1-0)
                label: AUTOMATION_RATE_LABEL,
            },
            {
                dateTime: expect.any(String),
                value: 0.75, // 3/(3+2-1)
                label: AUTOMATION_RATE_LABEL,
            },
            {
                dateTime: expect.any(String),
                value: 0.5833333333333334, // 7/(7+6-1)
                label: AUTOMATION_RATE_LABEL,
            },
        ],
    ]

    describe('useAutomationRateTimeSeriesData', () => {
        beforeEach(() => {
            useAutomationDatasetTimeSeriesMock.mockReturnValue({
                data: automationDatasetTimeSeries,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as UseQueryResult<TimeSeriesDataItem[][]>)
            useBillableTicketDatasetTimeSeriesMock.mockReturnValue({
                data: billableTicketDatasetTimeSeries,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as UseQueryResult<TimeSeriesDataItem[][]>)
        })

        it('should fetch and format data with a hook', () => {
            const { result } = renderHook(() =>
                useAutomationRateTimeSeriesData(
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

        it('should return loading state', () => {
            useAutomationDatasetTimeSeriesMock.mockReturnValue({
                data: undefined,
                isFetched: false,
                isFetching: true,
                isError: false,
            } as UseQueryResult<TimeSeriesDataItem[][]>)

            const { result } = renderHook(() =>
                useAutomationRateTimeSeriesData(
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

        it('should use NonFilteredDenominator InAutomationRate when the flag is enabled', () => {
            mockFlags({
                [FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate]:
                    true,
            })

            const { result } = renderHook(() =>
                useAutomationRateTimeSeriesData(
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

    describe('fetchAutomationRateTimeSeriesData', () => {
        beforeEach(() => {
            fetchAutomationDatasetTimeSeriesMock.mockResolvedValue(
                automationDatasetTimeSeries as any,
            )
            fetchBillableTicketDatasetTimeSeriesMock.mockResolvedValue(
                billableTicketDatasetTimeSeries as any,
            )
        })

        it('should fetch and format data with a fetch method', async () => {
            const result = await fetchAutomationRateTimeSeriesData(
                statsFilters,
                timezone,
                granularity,
                false,
                undefined,
            )

            expect(result).toEqual({
                data: expectedResult,
                isError: false,
                isFetching: false,
            })
        })

        it('should return no data when none received', async () => {
            fetchAutomationDatasetTimeSeriesMock.mockResolvedValue([])
            fetchBillableTicketDatasetTimeSeriesMock.mockResolvedValue([])
            const result = await fetchAutomationRateTimeSeriesData(
                statsFilters,
                timezone,
                granularity,
                false,
                undefined,
            )

            expect(result).toEqual({
                data: [[]],
                isError: false,
                isFetching: false,
            })
        })

        it('should use NonFilteredDenominator InAutomationRate when the flag is enabled', async () => {
            const result = await fetchAutomationRateTimeSeriesData(
                statsFilters,
                timezone,
                granularity,
                true,
                undefined,
            )

            expect(result).toEqual({
                data: expectedResult,
                isError: false,
                isFetching: false,
            })
        })
    })
})
