import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'

import {TicketChannel} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {useTimeSeriesReportData} from 'hooks/reporting/common/useTimeSeriesReportData'
import {timeSeriesReportSource} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {
    fetchMessagesSentTimeSeries,
    fetchTicketsClosedTimeSeries,
    fetchTicketsCreatedTimeSeries,
    fetchTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {ReportingGranularity} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {
    MESSAGES_SENT_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
} from 'services/reporting/constants'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/timeSeries')
const fetchTicketsCreatedTimeSeriesMock = assumeMock(
    fetchTicketsCreatedTimeSeries
)
const fetchTicketsClosedTimeSeriesMock = assumeMock(
    fetchTicketsClosedTimeSeries
)
const fetchTicketsRepliedTimeSeriesMock = assumeMock(
    fetchTicketsRepliedTimeSeries
)
const fetchMessagesSentTimeSeriesMock = assumeMock(fetchMessagesSentTimeSeries)

describe('useTrendReport', () => {
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
                    label: TicketMeasure.TicketCount,
                },
            ],
        ],
    }

    beforeEach(() => {
        fetchTicketsCreatedTimeSeriesMock.mockResolvedValue(
            defaultTimeSeries.data
        )
        fetchTicketsClosedTimeSeriesMock.mockResolvedValue(
            defaultTimeSeries.data
        )
        fetchTicketsRepliedTimeSeriesMock.mockResolvedValue(
            defaultTimeSeries.data
        )
        fetchMessagesSentTimeSeriesMock.mockResolvedValue(
            defaultTimeSeries.data
        )
    })

    it('should return the labeled data', async () => {
        const {result} = renderHook(() =>
            useTimeSeriesReportData(
                defaultStatsFilters,
                'UTC',
                ReportingGranularity.Day,
                timeSeriesReportSource
            )
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

        const {result} = renderHook(() =>
            useTimeSeriesReportData(
                defaultStatsFilters,
                'UTC',
                ReportingGranularity.Day,
                timeSeriesReportSource
            )
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [],
            })
        })
    })
})
