import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { useDistributionTrendReportData } from 'domains/reporting/hooks/common/useDistributionTrendReportData'
import { useTimeSeriesReportData } from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { fetchWorkloadPerChannelDistribution } from 'domains/reporting/hooks/distributions'
import {
    CUSTOMER_EXPERIENCE_REPORT_FILE_NAME,
    TICKET_VOLUME_REPORT_FILE_NAME,
    useDownloadOverViewData,
    WORKLOAD_REPORT_FILE_NAME,
} from 'domains/reporting/hooks/support-performance/overview/useDownloadOverviewData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useIsHrtAiEnabled } from 'domains/reporting/hooks/useIsHrtAiEnabled'
import type { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import {
    MESSAGES_SENT_LABEL,
    WORKLOAD_BY_CHANNEL_LABEL,
} from 'domains/reporting/services/constants'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'domains/reporting/services/supportPerformanceReportingService'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'

jest.mock('domains/reporting/hooks/useIsHrtAiEnabled')
const useIsHrtAiEnabledMock = assumeMock(useIsHrtAiEnabled)

jest.mock('utils/file')
jest.mock('domains/reporting/services/supportPerformanceReportingService')

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useNewStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/services/supportPerformanceReportingService')
const saveTrendReportMock = assumeMock(createTrendReport)
const saveTimeSeriesReportMock = assumeMock(createTimeSeriesReport)

jest.mock('domains/reporting/hooks/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)

jest.mock('domains/reporting/hooks/common/useTimeSeriesReportData')
const useTimeSeriesReportDataMock = assumeMock(useTimeSeriesReportData)

jest.mock('domains/reporting/hooks/common/useDistributionTrendReportData')
const useDistributionTrendReportDataMock = assumeMock(
    useDistributionTrendReportData,
)

describe('useDownloadOverviewData', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: withDefaultLogicalOperator([TicketChannel.Chat]),
        integrations: withDefaultLogicalOperator([
            integrationsState.integrations[0].id,
        ]),
        agents: withDefaultLogicalOperator([agents[0].id]),
        tags: [
            {
                ...withDefaultLogicalOperator([1]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }

    const defaultTimeSeries = {
        data: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],
    } as ReturnType<typeof useTimeSeries>

    beforeEach(() => {
        useIsHrtAiEnabledMock.mockReturnValue(true)
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            granularity: ReportingGranularity.Day,
            userTimezone: DEFAULT_TIMEZONE,
        })

        saveTrendReportMock.mockReturnValue({
            files: {
                'trend-report.csv': 'trend data',
            },
        })

        // Ensure createTimeSeriesReport returns something with `.files`
        saveTimeSeriesReportMock.mockReturnValue({
            files: {
                'timeseries-report.csv': 'timeseries data',
            },
        })
    })

    it('should fetch data and format the reports', async () => {
        const trendReportData = [
            {
                label: 'string',
                value: '23',
                prevValue: '46',
            },
        ]
        const timeSeriesReportData = [
            { label: MESSAGES_SENT_LABEL, ...defaultTimeSeries },
        ]
        const workloadData = [
            {
                label: 'email',
                value: '1',
                prevValue: '2',
            },
            {
                label: 'facebook',
                value: '1',
                prevValue: '2',
            },
        ]
        useTrendReportDataMock.mockReturnValue({
            isFetching: false,
            data: trendReportData,
        })
        useTimeSeriesReportDataMock.mockReturnValue({
            isFetching: false,
            data: timeSeriesReportData,
        })
        useDistributionTrendReportDataMock.mockReturnValue({
            isFetching: false,
            data: workloadData,
        })

        renderHook(useDownloadOverViewData, {
            wrapper: ({ children }) => <div>{children}</div>,
        })

        await waitFor(() => {
            expect(saveTrendReportMock).toHaveBeenCalledWith(
                trendReportData,
                getCsvFileNameWithDates(
                    defaultStatsFilters.period,
                    CUSTOMER_EXPERIENCE_REPORT_FILE_NAME,
                ),
            )
            expect(saveTrendReportMock).toHaveBeenCalledWith(
                [...trendReportData, ...workloadData],
                getCsvFileNameWithDates(
                    defaultStatsFilters.period,
                    WORKLOAD_REPORT_FILE_NAME,
                ),
            )
            expect(saveTimeSeriesReportMock).toHaveBeenCalledWith(
                timeSeriesReportData,
                getCsvFileNameWithDates(
                    defaultStatsFilters.period,
                    TICKET_VOLUME_REPORT_FILE_NAME,
                ),
            )
        })
    })

    it('should not fetch previous workload data when the fetching is disabled', async () => {
        renderHook(() => useDownloadOverViewData(false), {
            wrapper: ({ children }) => <div>{children}</div>,
        })

        expect(useDistributionTrendReportDataMock).toHaveBeenCalledWith(
            defaultStatsFilters,
            'UTC',
            {
                fetchCurrentDistribution: fetchWorkloadPerChannelDistribution,
                fetchPreviousDistribution: expect.any(Function),
                labelPrefix: WORKLOAD_BY_CHANNEL_LABEL,
                metricFormat: 'decimal',
            },
        )
        const previousFetchFunction =
            useDistributionTrendReportDataMock.mock.calls[0][2]
                ?.fetchPreviousDistribution
        if (previousFetchFunction) {
            expect(
                await previousFetchFunction(defaultStatsFilters, 'someString'),
            ).toEqual({ data: [] })
        }
    })
})
