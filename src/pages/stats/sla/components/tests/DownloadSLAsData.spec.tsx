import {act, fireEvent, render, waitFor} from '@testing-library/react'

import React from 'react'

import {TicketChannel} from 'business/types/ticket'
import {logEvent, SegmentEvent} from 'common/segment'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {
    SLA_OVERVIEW_FILENAME,
    SLA_REPORT_FILENAME,
    SLA_TICKETS_IN_POLICY_FILENAME,
    SLA_TREND_FILENAME,
} from 'hooks/reporting/sla/useDownloadSLAsData'
import {fetchSatisfiedOrBreachedTicketsTimeSeries} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {
    fetchBreachedSlaTicketsTrend,
    fetchSatisfiedSlaTicketsTrend,
} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import {fetchTicketSlaAchievementRateTrend} from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {ReportingGranularity} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {
    DEFAULT_TIMEZONE,
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'pages/stats/constants'

import {DownloadSLAsData} from 'pages/stats/sla/components/DownloadSLAsData'
import {
    ACHIEVED_SLA_LABEL,
    ACHIEVEMENT_RATE_LABEL,
    BREACHED_SLA_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
    TICKETS_WITH_BREACHED_SLAS_LABEL,
} from 'services/reporting/constants'
import {createTimeSeriesPerDimensionReport} from 'services/reporting/SLAsReportingService'
import {createTrendReport} from 'services/reporting/supportPerformanceReportingService'
import {saveZippedFiles} from 'utils/file'
import {assumeMock} from 'utils/testing'

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock('hooks/reporting/sla/useSLAsTicketsTrends')
const fetchBreachedSlaTicketsTrendMock = assumeMock(
    fetchBreachedSlaTicketsTrend
)
jest.mock('hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries')
jest.mock('hooks/reporting/sla/useTicketSlaAchievementRate')
const fetchTicketSlaAchievementRateTrendMock = assumeMock(
    fetchTicketSlaAchievementRateTrend
)
const fetchSatisfiedSlaTicketsTrendMock = assumeMock(
    fetchSatisfiedSlaTicketsTrend
)
const fetchSatisfiedOrBreachedTicketsTimeSeriesMock = assumeMock(
    fetchSatisfiedOrBreachedTicketsTimeSeries
)

const defaultStatsFilters: LegacyStatsFilters = {
    period: {
        start_datetime: '2021-02-03T00:00:00.000',
        end_datetime: '2021-02-03T23:59:59.999',
    },
    channels: [TicketChannel.Chat],
    integrations: [integrationsState.integrations[0].id],
    agents: [agents[0].id],
    tags: [1],
}

const defaultMetricTrend: MetricTrend = {
    isFetching: false,
    isError: true,
    data: {
        value: 456,
        prevValue: 123,
    },
}
const breachedTicketsSLAsMetricTrend = {
    ...defaultMetricTrend,
    data: {
        value: 95,
        prevValue: 100,
    },
}
const satisfiedTicketsSLAsMetricTrend = {
    ...defaultMetricTrend,
    data: {
        value: 97,
        prevValue: 100,
    },
}
const slaTicketAchievementRateMetricTrend = {
    ...defaultMetricTrend,
    data: {
        value: 98,
        prevValue: 100,
    },
}
const timeSeriesData: Record<string, TimeSeriesDataItem[][]> = {
    [TicketSLAStatus.Breached]: [
        [
            {
                dateTime: '2021-02-03T00:00:00.000Z',
                value: 200,
                label: TicketSLAStatus.Satisfied,
            },
        ],
    ],
    [TicketSLAStatus.Pending]: [
        [
            {
                dateTime: '2021-02-03T00:00:00.000Z',
                value: 400,
                label: TicketSLAStatus.Pending,
            },
        ],
    ],
    [TicketSLAStatus.Satisfied]: [
        [
            {
                dateTime: '2021-02-03T00:00:00.000Z',
                value: 600,
                label: TicketSLAStatus.Satisfied,
            },
        ],
    ],
}

describe('DownloadSLAsData', () => {
    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            userTimezone: DEFAULT_TIMEZONE,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
        fetchTicketSlaAchievementRateTrendMock.mockResolvedValue(
            slaTicketAchievementRateMetricTrend
        )
        fetchBreachedSlaTicketsTrendMock.mockResolvedValue(
            breachedTicketsSLAsMetricTrend
        )
        fetchSatisfiedSlaTicketsTrendMock.mockResolvedValue(
            satisfiedTicketsSLAsMetricTrend
        )
        fetchSatisfiedOrBreachedTicketsTimeSeriesMock.mockResolvedValue(
            timeSeriesData
        )
    })

    it('should send event to segment and call saveReport on download data button click', async () => {
        const {getByText} = render(<DownloadSLAsData />)

        const button = getByText(DOWNLOAD_DATA_BUTTON_LABEL)
        await waitFor(() => {
            expect(button).toBeAriaEnabled()
        })
        act(() => {
            fireEvent.click(button)
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
        expect(saveZippedFilesMock).toHaveBeenCalledWith(
            {
                ...createTrendReport(
                    [
                        {
                            ...slaTicketAchievementRateMetricTrend.data,
                            label: ACHIEVEMENT_RATE_LABEL,
                        },
                        {
                            ...breachedTicketsSLAsMetricTrend.data,
                            label: TICKETS_WITH_BREACHED_SLAS_LABEL,
                        },
                    ],
                    getCsvFileNameWithDates(
                        defaultStatsFilters.period,
                        SLA_OVERVIEW_FILENAME
                    )
                ).files,
                ...createTrendReport(
                    [
                        {
                            ...breachedTicketsSLAsMetricTrend.data,
                            label: BREACHED_SLA_LABEL,
                        },
                        {
                            ...satisfiedTicketsSLAsMetricTrend.data,
                            label: ACHIEVED_SLA_LABEL,
                        },
                    ],
                    getCsvFileNameWithDates(
                        defaultStatsFilters.period,
                        SLA_TICKETS_IN_POLICY_FILENAME
                    )
                ).files,
                ...createTimeSeriesPerDimensionReport(
                    [
                        {
                            data: [
                                [
                                    DATES_WITHIN_PERIOD_LABEL,
                                    BREACHED_SLA_LABEL,
                                    ACHIEVED_SLA_LABEL,
                                ],
                                [
                                    defaultStatsFilters.period.start_datetime,
                                    'N/A',
                                    'N/A',
                                ],
                            ],
                            label: SLA_TREND_FILENAME,
                        },
                    ],
                    defaultStatsFilters.period
                ).files,
            },
            getCsvFileNameWithDates(
                defaultStatsFilters.period,
                SLA_REPORT_FILENAME
            )
        )
    })
})
