import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'

import {TicketChannel} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {useTrendReportData} from 'hooks/reporting/common/useTrendReportData'
import {
    fetchClosedTicketsTrend,
    fetchMessagesSentTrend,
    fetchOpenTicketsTrend,
    fetchTicketsCreatedTrend,
    fetchTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import {workloadReportSource} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {LegacyStatsFilters} from 'models/stat/types'
import {
    MESSAGES_SENT_LABEL,
    OPEN_TICKETS_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
} from 'services/reporting/constants'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/metricTrends')
const useOpenTicketsTrendMock = assumeMock(fetchOpenTicketsTrend)
const useClosedTicketsTrendMock = assumeMock(fetchClosedTicketsTrend)
const useTicketsCreatedTrendMock = assumeMock(fetchTicketsCreatedTrend)
const useTicketsRepliedTrendMock = assumeMock(fetchTicketsRepliedTrend)
const useMessagesSentTrendMock = assumeMock(fetchMessagesSentTrend)

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
    const defaultMetricTrend: MetricTrend = {
        isFetching: false,
        isError: true,
        data: {
            value: 456,
            prevValue: 123,
        },
    }
    const openTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 90,
            prevValue: 100,
        },
    }
    const closedTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 91,
            prevValue: 100,
        },
    }
    const createdTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 92,
            prevValue: 100,
        },
    }
    const repliedTicketsMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 93,
            prevValue: 100,
        },
    }
    const messagesSentMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 94,
            prevValue: 100,
        },
    }

    beforeEach(() => {
        useOpenTicketsTrendMock.mockResolvedValue(openTicketsMetricTrend)
        useClosedTicketsTrendMock.mockResolvedValue(closedTicketsMetricTrend)
        useTicketsCreatedTrendMock.mockResolvedValue(createdTicketsMetricTrend)
        useTicketsRepliedTrendMock.mockResolvedValue(repliedTicketsMetricTrend)
        useMessagesSentTrendMock.mockResolvedValue(messagesSentMetricTrend)
    })

    it('should return the labeled data', async () => {
        const {result} = renderHook(() =>
            useTrendReportData(defaultStatsFilters, 'UTC', workloadReportSource)
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [
                    {
                        label: OPEN_TICKETS_LABEL,
                        value: openTicketsMetricTrend.data.value,
                        prevValue: openTicketsMetricTrend.data.prevValue,
                    },
                    {
                        label: TICKETS_CREATED_LABEL,
                        value: createdTicketsMetricTrend.data.value,
                        prevValue: createdTicketsMetricTrend.data.prevValue,
                    },
                    {
                        label: TICKETS_REPLIED_LABEL,
                        value: repliedTicketsMetricTrend.data.value,
                        prevValue: repliedTicketsMetricTrend.data.prevValue,
                    },
                    {
                        label: TICKETS_CLOSED_LABEL,
                        value: closedTicketsMetricTrend.data.value,
                        prevValue: closedTicketsMetricTrend.data.prevValue,
                    },
                    {
                        label: MESSAGES_SENT_LABEL,
                        value: messagesSentMetricTrend.data.value,
                        prevValue: messagesSentMetricTrend.data.prevValue,
                    },
                ],
            })
        })
    })

    it('should return the labeled data', async () => {
        useOpenTicketsTrendMock.mockRejectedValue({})
        const {result} = renderHook(() =>
            useTrendReportData(defaultStatsFilters, 'UTC', workloadReportSource)
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [],
            })
        })
    })
})
