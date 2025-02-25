import React from 'react'

import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { TicketChannel } from 'business/types/ticket'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { useDistributionTrendReportData } from 'hooks/reporting/common/useDistributionTrendReportData'
import { useTimeSeriesReportData } from 'hooks/reporting/common/useTimeSeriesReportData'
import { useTrendReportData } from 'hooks/reporting/common/useTrendReportData'
import { fetchWorkloadPerChannelDistribution } from 'hooks/reporting/distributions'
import {
    CUSTOMER_EXPERIENCE_REPORT_FILE_NAME,
    getCsvFileNameWithDates,
    TICKET_VOLUME_REPORT_FILE_NAME,
    useDownloadOverViewData,
    WORKLOAD_REPORT_FILE_NAME,
} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { useTimeSeries } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { LegacyStatsFilters } from 'models/stat/types'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import {
    MESSAGES_SENT_LABEL,
    WORKLOAD_BY_CHANNEL_LABEL,
} from 'services/reporting/constants'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'services/reporting/supportPerformanceReportingService'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import { assumeMock } from 'utils/testing'

jest.mock('utils/file')
jest.mock('services/reporting/supportPerformanceReportingService')

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

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
    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: [TicketChannel.Chat],
        integrations: [integrationsState.integrations[0].id],
        agents: [agents[0].id],
        tags: [1],
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
            cleanStatsFilters: fromLegacyStatsFilters(defaultStatsFilters),
            isAnalyticsNewFilters: true,
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
            fromLegacyStatsFilters(defaultStatsFilters),
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
