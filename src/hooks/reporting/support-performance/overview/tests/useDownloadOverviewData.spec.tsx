import React from 'react'

import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { TicketChannel } from 'business/types/ticket'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { useDistributionTrendReportData } from 'hooks/reporting/common/useDistributionTrendReportData'
import { useTimeSeriesReportData } from 'hooks/reporting/common/useTimeSeriesReportData'
import { useTrendReportData } from 'hooks/reporting/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { fetchWorkloadPerChannelDistribution } from 'hooks/reporting/distributions'
import {
    CUSTOMER_EXPERIENCE_REPORT_FILE_NAME,
    TICKET_VOLUME_REPORT_FILE_NAME,
    useDownloadOverViewData,
    WORKLOAD_REPORT_FILE_NAME,
} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTimeSeries } from 'hooks/reporting/useTimeSeries'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import {
    MESSAGES_SENT_LABEL,
    WORKLOAD_BY_CHANNEL_LABEL,
} from 'services/reporting/constants'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'services/reporting/supportPerformanceReportingService'
import { assumeMock } from 'utils/testing'

jest.mock('utils/file')
jest.mock('services/reporting/supportPerformanceReportingService')

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useNewStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('services/reporting/supportPerformanceReportingService')
const saveTrendReportMock = assumeMock(createTrendReport)
const saveTimeSeriesReportMock = assumeMock(createTimeSeriesReport)

jest.mock('hooks/reporting/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)

jest.mock('hooks/reporting/common/useTimeSeriesReportData')
const useTimeSeriesReportDataMock = assumeMock(useTimeSeriesReportData)

jest.mock('hooks/reporting/common/useDistributionTrendReportData')
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
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            granularity: ReportingGranularity.Day,
            userTimezone: DEFAULT_TIMEZONE,
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
