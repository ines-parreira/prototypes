import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { TicketChannel } from 'business/types/ticket'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import {
    useTimeSeriesPerDimensionReportData,
    useTimeSeriesReportData,
} from 'hooks/reporting/common/useTimeSeriesReportData'
import { slaTrendSource } from 'hooks/reporting/sla/useDownloadSLAsData'
import { fetchSatisfiedOrBreachedTicketsTimeSeries } from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import { timeSeriesReportSource } from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {
    fetchMessagesSentTimeSeries,
    fetchOneTouchTicketsTimeSeries,
    fetchTicketsClosedTimeSeries,
    fetchTicketsCreatedTimeSeries,
    fetchTicketsRepliedTimeSeries,
    fetchZeroTouchTicketsTimeSeries,
} from 'hooks/reporting/timeSeries'
import { TicketSLAStatus } from 'models/reporting/cubes/sla/TicketSLACube'
import { TicketMeasure } from 'models/reporting/cubes/TicketCube'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import {
    ACHIEVED_SLA_LABEL,
    BREACHED_SLA_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
    MESSAGES_SENT_LABEL,
    NOT_AVAILABLE_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
} from 'services/reporting/constants'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/timeSeries')
const fetchTicketsCreatedTimeSeriesMock = assumeMock(
    fetchTicketsCreatedTimeSeries,
)
const fetchTicketsClosedTimeSeriesMock = assumeMock(
    fetchTicketsClosedTimeSeries,
)
const fetchTicketsRepliedTimeSeriesMock = assumeMock(
    fetchTicketsRepliedTimeSeries,
)
const fetchMessagesSentTimeSeriesMock = assumeMock(fetchMessagesSentTimeSeries)
const useZeroTouchTicketsTimeSeriesMock = assumeMock(
    fetchOneTouchTicketsTimeSeries,
)
const fetchZeroTouchTicketsTimeSeriesMock = assumeMock(
    fetchZeroTouchTicketsTimeSeries,
)

jest.mock('hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries')
const fetchSatisfiedOrBreachedTicketsTimeSeriesMock = assumeMock(
    fetchSatisfiedOrBreachedTicketsTimeSeries,
)

describe('timeSeriesReportData', () => {
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
                    label: TicketMeasure.TicketCount,
                },
            ],
        ],
    }

    describe('useTimeSeriesReportData', () => {
        beforeEach(() => {
            fetchTicketsCreatedTimeSeriesMock.mockResolvedValue(
                defaultTimeSeries.data,
            )
            fetchTicketsClosedTimeSeriesMock.mockResolvedValue(
                defaultTimeSeries.data,
            )
            fetchTicketsRepliedTimeSeriesMock.mockResolvedValue(
                defaultTimeSeries.data,
            )
            fetchMessagesSentTimeSeriesMock.mockResolvedValue(
                defaultTimeSeries.data,
            )
            useZeroTouchTicketsTimeSeriesMock.mockResolvedValue(
                defaultTimeSeries.data,
            )
            fetchZeroTouchTicketsTimeSeriesMock.mockResolvedValue(
                defaultTimeSeries.data,
            )
        })

        it('should return the labeled data', async () => {
            const { result } = renderHook(() =>
                useTimeSeriesReportData(
                    defaultStatsFilters,
                    'UTC',
                    ReportingGranularity.Day,
                    timeSeriesReportSource,
                ),
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    isFetching: false,
                    data: [
                        {
                            label: TICKETS_CREATED_LABEL,
                            data: defaultTimeSeries.data,
                        },
                        {
                            label: TICKETS_CLOSED_LABEL,
                            data: defaultTimeSeries.data,
                        },
                        {
                            label: TICKETS_REPLIED_LABEL,
                            data: defaultTimeSeries.data,
                        },
                        {
                            label: MESSAGES_SENT_LABEL,
                            data: defaultTimeSeries.data,
                        },
                    ],
                })
            })
        })

        it('should return empty data on failed fetch', async () => {
            fetchTicketsCreatedTimeSeriesMock.mockRejectedValue({})

            const { result } = renderHook(() =>
                useTimeSeriesReportData(
                    defaultStatsFilters,
                    'UTC',
                    ReportingGranularity.Day,
                    timeSeriesReportSource,
                ),
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    isFetching: false,
                    data: [],
                })
            })
        })
    })

    describe('fetchTimeSeriesPerDimensionReportData', () => {
        it('should return the labeled data', async () => {
            const timeSeriesPerDimension = {
                [TicketSLAStatus.Breached]: [
                    [
                        {
                            dateTime: '2021-02-03T00:00:00.000',
                            value: 23,
                            label: TicketMeasure.TicketCount,
                        },
                    ],
                ],
                [TicketSLAStatus.Satisfied]: [
                    [
                        {
                            dateTime: '2021-02-03T00:00:00.000',
                            value: 45,
                            label: TicketMeasure.TicketCount,
                        },
                    ],
                ],
            }

            fetchSatisfiedOrBreachedTicketsTimeSeriesMock.mockResolvedValue(
                timeSeriesPerDimension,
            )

            const { result } = renderHook(() =>
                useTimeSeriesPerDimensionReportData(
                    defaultStatsFilters,
                    'UTC',
                    ReportingGranularity.Day,
                    slaTrendSource,
                ),
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    isFetching: false,
                    data: [
                        {
                            data: [
                                [
                                    DATES_WITHIN_PERIOD_LABEL,
                                    BREACHED_SLA_LABEL,
                                    ACHIEVED_SLA_LABEL,
                                ],
                                ['2021-02-03T00:00:00.000', 23, 45],
                            ],
                            label: 'trend',
                        },
                    ],
                })
            })
        })

        it('should return the N/A label when no data', async () => {
            const timeSeriesPerDimension = {
                [TicketSLAStatus.Breached]: [
                    [
                        {
                            dateTime: 'dateOutOfPeriod',
                            value: 8,
                            label: TicketMeasure.TicketCount,
                        },
                    ],
                ],
                [TicketSLAStatus.Satisfied]: [
                    [
                        {
                            dateTime: 'otherDate',
                            value: 12,
                            label: TicketMeasure.TicketCount,
                        },
                    ],
                ],
            }

            fetchSatisfiedOrBreachedTicketsTimeSeriesMock.mockResolvedValue(
                timeSeriesPerDimension,
            )

            const { result } = renderHook(() =>
                useTimeSeriesPerDimensionReportData(
                    defaultStatsFilters,
                    'UTC',
                    ReportingGranularity.Day,
                    slaTrendSource,
                ),
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    isFetching: false,
                    data: [
                        {
                            data: [
                                [
                                    DATES_WITHIN_PERIOD_LABEL,
                                    BREACHED_SLA_LABEL,
                                    ACHIEVED_SLA_LABEL,
                                ],
                                [
                                    '2021-02-03T00:00:00.000',
                                    NOT_AVAILABLE_LABEL,
                                    NOT_AVAILABLE_LABEL,
                                ],
                            ],
                            label: 'trend',
                        },
                    ],
                })
            })
        })

        it('should return no data on error', async () => {
            const timeSeriesPerDimension = {
                [TicketSLAStatus.Breached]: [
                    [
                        {
                            dateTime: 'dateOutOfPeriod',
                            value: 8,
                            label: TicketMeasure.TicketCount,
                        },
                    ],
                ],
                [TicketSLAStatus.Satisfied]: [
                    [
                        {
                            dateTime: 'otherDate',
                            value: 12,
                            label: TicketMeasure.TicketCount,
                        },
                    ],
                ],
            }

            fetchSatisfiedOrBreachedTicketsTimeSeriesMock.mockRejectedValue(
                timeSeriesPerDimension,
            )

            const { result } = renderHook(() =>
                useTimeSeriesPerDimensionReportData(
                    defaultStatsFilters,
                    'UTC',
                    ReportingGranularity.Day,
                    slaTrendSource,
                ),
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    isFetching: false,
                    data: [],
                })
            })
        })
    })
})
