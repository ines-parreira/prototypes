import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { TicketChannel } from 'business/types/ticket'
import { User } from 'config/types/user'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { useAIAgentUser } from 'hooks/reporting/automate/useAIAgentUserId'
import { useTrendReportData } from 'hooks/reporting/common/useTrendReportData'
import {
    fetchClosedTicketsTrend,
    fetchMessagesSentTrend,
    fetchOpenTicketsTrend,
    fetchTicketsCreatedTrend,
    fetchTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import { getWorkloadReportSource } from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import { fetchOneTouchTicketsPercentageMetricTrend } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { fetchZeroTouchTicketsMetricTrend } from 'hooks/reporting/support-performance/overview/useZeroTouchTicketsMetricTrend'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { LegacyStatsFilters } from 'models/stat/types'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { formatMetricValue } from 'pages/stats/common/utils'
import {
    MESSAGES_SENT_LABEL,
    ONE_TOUCH_TICKETS_LABEL,
    OPEN_TICKETS_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
    ZERO_TOUCH_TICKETS_LABEL,
} from 'services/reporting/constants'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/metricTrends')
const useOpenTicketsTrendMock = assumeMock(fetchOpenTicketsTrend)
const useClosedTicketsTrendMock = assumeMock(fetchClosedTicketsTrend)
const useTicketsCreatedTrendMock = assumeMock(fetchTicketsCreatedTrend)
const useTicketsRepliedTrendMock = assumeMock(fetchTicketsRepliedTrend)
const useMessagesSentTrendMock = assumeMock(fetchMessagesSentTrend)
jest.mock(
    'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend',
)
const useOneTouchTicketsMock = assumeMock(
    fetchOneTouchTicketsPercentageMetricTrend,
)
jest.mock(
    'hooks/reporting/support-performance/overview/useZeroTouchTicketsMetricTrend',
)
const useZeroTouchTicketsMock = assumeMock(fetchZeroTouchTicketsMetricTrend)

jest.mock('hooks/reporting/automate/useAIAgentUserId')
const useAIAgentUserMock = assumeMock(useAIAgentUser)

jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')
const useMoneySavedPerInteractionWithAutomateMock = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)

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
    const oneTouchTicketMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 100,
            prevValue: 20,
        },
    }
    const zeroTouchTicketMetricTrend = {
        ...defaultMetricTrend,
        data: {
            value: 40,
            prevValue: 60,
        },
    }

    const resultData = [
        {
            label: OPEN_TICKETS_LABEL,
            value: formatMetricValue(openTicketsMetricTrend.data.value),
            prevValue: formatMetricValue(openTicketsMetricTrend.data.prevValue),
        },
        {
            label: TICKETS_CREATED_LABEL,
            value: formatMetricValue(createdTicketsMetricTrend.data.value),
            prevValue: formatMetricValue(
                createdTicketsMetricTrend.data.prevValue,
            ),
        },
        {
            label: TICKETS_REPLIED_LABEL,
            value: formatMetricValue(repliedTicketsMetricTrend.data.value),
            prevValue: formatMetricValue(
                repliedTicketsMetricTrend.data.prevValue,
            ),
        },
        {
            label: TICKETS_CLOSED_LABEL,
            value: formatMetricValue(closedTicketsMetricTrend.data.value),
            prevValue: formatMetricValue(
                closedTicketsMetricTrend.data.prevValue,
            ),
        },
        {
            label: MESSAGES_SENT_LABEL,
            value: formatMetricValue(messagesSentMetricTrend.data.value),
            prevValue: formatMetricValue(
                messagesSentMetricTrend.data.prevValue,
            ),
        },
        {
            label: ONE_TOUCH_TICKETS_LABEL,
            value: formatMetricValue(
                oneTouchTicketMetricTrend.data.value,
                'percent',
            ),
            prevValue: formatMetricValue(
                oneTouchTicketMetricTrend.data.prevValue,
                'percent',
            ),
        },
    ]

    beforeEach(() => {
        useAIAgentUserMock.mockReturnValue({
            id: 23,
        } as User)
        useMoneySavedPerInteractionWithAutomateMock.mockReturnValue(123)
        useOpenTicketsTrendMock.mockResolvedValue(openTicketsMetricTrend)
        useClosedTicketsTrendMock.mockResolvedValue(closedTicketsMetricTrend)
        useTicketsCreatedTrendMock.mockResolvedValue(createdTicketsMetricTrend)
        useTicketsRepliedTrendMock.mockResolvedValue(repliedTicketsMetricTrend)
        useMessagesSentTrendMock.mockResolvedValue(messagesSentMetricTrend)
        useOneTouchTicketsMock.mockResolvedValue(oneTouchTicketMetricTrend)
        useZeroTouchTicketsMock.mockResolvedValue(zeroTouchTicketMetricTrend)
    })

    it('should return the labeled data', async () => {
        const { result } = renderHook(() =>
            useTrendReportData(
                defaultStatsFilters,
                'UTC',
                getWorkloadReportSource(true),
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [
                    ...resultData,
                    {
                        label: ZERO_TOUCH_TICKETS_LABEL,
                        value: formatMetricValue(
                            zeroTouchTicketMetricTrend.data.value,
                        ),
                        prevValue: formatMetricValue(
                            zeroTouchTicketMetricTrend.data.prevValue,
                        ),
                    },
                ],
            })
        })
    })

    it('should return the labeled data without zero touch ticket', async () => {
        const { result } = renderHook(() =>
            useTrendReportData(
                defaultStatsFilters,
                'UTC',
                getWorkloadReportSource(false),
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: resultData,
            })
        })
    })

    it('should return the labeled data', async () => {
        useOpenTicketsTrendMock.mockRejectedValue({})

        const { result } = renderHook(() =>
            useTrendReportData(
                defaultStatsFilters,
                'UTC',
                getWorkloadReportSource(true),
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
