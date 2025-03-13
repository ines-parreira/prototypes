import React from 'react'

import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { TicketChannel } from 'business/types/ticket'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { useTimeSeriesReportData } from 'hooks/reporting/common/useTimeSeriesReportData'
import { useTrendReportData } from 'hooks/reporting/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTimeSeries } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { LegacyStatsFilters } from 'models/stat/types'
import useAiSalesAgentOverviewReportData, {
    AI_SALES_AGENT_GMV_INFLUENCED_OVER_TIME,
    AI_SALES_AGENT_METRIC_FILE_NAME,
} from 'pages/stats/aiSalesAgent/hooks/aiSalesAgentReportingService'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'services/reporting/supportPerformanceReportingService'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import { assumeMock } from 'utils/testing'

jest.mock('utils/file')
jest.mock('services/reporting/supportPerformanceReportingService')

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('services/reporting/supportPerformanceReportingService')
const saveTrendReportMock = assumeMock(createTrendReport)
const saveTimeSeriesReportMock = assumeMock(createTimeSeriesReport)

jest.mock('hooks/reporting/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)

jest.mock('hooks/reporting/common/useTimeSeriesReportData')
const useTimeSeriesReportDataMock = assumeMock(useTimeSeriesReportData)

describe('useAiSalesAgentOverviewReportData', () => {
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
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: fromLegacyStatsFilters(defaultStatsFilters),
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
        const timeSeriesReportData = [{ label: 'label', ...defaultTimeSeries }]

        useTrendReportDataMock.mockReturnValue({
            isFetching: false,
            data: trendReportData,
        })
        useTimeSeriesReportDataMock.mockReturnValue({
            isFetching: false,
            data: timeSeriesReportData,
        })

        renderHook(useAiSalesAgentOverviewReportData, {
            wrapper: ({ children }) => <div>{children}</div>,
        })

        await waitFor(() => {
            expect(saveTrendReportMock).toHaveBeenCalledWith(
                trendReportData,
                getCsvFileNameWithDates(
                    defaultStatsFilters.period,
                    AI_SALES_AGENT_METRIC_FILE_NAME,
                ),
            )

            expect(saveTimeSeriesReportMock).toHaveBeenCalledWith(
                timeSeriesReportData,
                getCsvFileNameWithDates(
                    defaultStatsFilters.period,
                    AI_SALES_AGENT_GMV_INFLUENCED_OVER_TIME,
                ),
            )
        })
    })
})
