import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    useClosedTicketsMetricPerAgent,
    useZeroTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { useZeroTouchTicketsPercentageMetricPerAgent } from 'hooks/reporting/support-performance/agents/useZeroTouchTicketsPercentageMetricPerAgent'
import { OrderDirection } from 'models/api/types'
import {
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import { LegacyStatsFilters } from 'models/stat/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/metricsPerAgent')
const useZeroTouchTicketsMetricPerAgentMock = assumeMock(
    useZeroTouchTicketsMetricPerAgent,
)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent,
)

describe('useZeroTouchTicketsPercentageMetricPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: LegacyStatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: [TicketChannel.Email, TicketChannel.Chat],
        integrations: [1],
        tags: [1, 2],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc
    const agentId = 'someId'
    const anotherAgentId = 'someOtherId'
    const incompleteDataAgentId = 'incompleteId'
    const closedTickets = 320
    const anotherAgentsClosedTickets = 50
    const incompleteDataAgentClosedTickets = 50
    const ticketCount = 15
    const anotherAgentsTicketCount = 10

    it('should return percentage of one touch tickets', () => {
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketMeasure.TicketCount]: `${closedTickets}`,
                        [TicketDimension.AssigneeUserId]: agentId,
                    },
                    {
                        [TicketMeasure.TicketCount]: `${anotherAgentsClosedTickets}`,
                        [TicketDimension.AssigneeUserId]: anotherAgentId,
                    },
                    {
                        [TicketMeasure.TicketCount]: `${incompleteDataAgentClosedTickets}`,
                        [TicketDimension.AssigneeUserId]: incompleteDataAgentId,
                    },
                ],
                value: closedTickets,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        useZeroTouchTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketMeasure.TicketCount]: `${ticketCount}`,
                        [TicketDimension.AssigneeUserId]: agentId,
                    },
                    {
                        [TicketMeasure.TicketCount]: `${anotherAgentsTicketCount}`,
                        [TicketDimension.AssigneeUserId]: anotherAgentId,
                    },
                ],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        const { result } = renderHook(
            () =>
                useZeroTouchTicketsPercentageMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId,
                ),
            {},
        )

        expect(result.current).toEqual({
            data: {
                allData: [
                    {
                        [TicketDimension.AssigneeUserId]: agentId,
                        [TicketMeasure.TicketCount]: `${
                            (ticketCount / closedTickets) * 100
                        }`,
                    },
                    {
                        [TicketDimension.AssigneeUserId]: anotherAgentId,
                        [TicketMeasure.TicketCount]: `${
                            (anotherAgentsTicketCount /
                                anotherAgentsClosedTickets) *
                            100
                        }`,
                    },
                ],
                value: (ticketCount / closedTickets) * 100,
                decile: 2,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should return null when no data is available', () => {
        const missingAgentId = '567'
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: null,
            isError: false,
            isFetching: false,
        })

        useZeroTouchTicketsMetricPerAgentMock.mockReturnValue({
            data: null,
            isError: false,
            isFetching: false,
        })

        const { result } = renderHook(
            () =>
                useZeroTouchTicketsPercentageMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    missingAgentId,
                ),
            {},
        )

        expect(result.current).toEqual({
            data: {
                allData: [],
                value: null,
                decile: -0,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should return null when partial data is available', () => {
        const missingAgentId = '567'
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: null,
            isError: false,
            isFetching: false,
        })

        useZeroTouchTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [TicketMeasure.TicketCount]: `${ticketCount}`,
                        [TicketDimension.AssigneeUserId]: agentId,
                    },
                    {
                        [TicketMeasure.TicketCount]: `${anotherAgentsTicketCount}`,
                        [TicketDimension.AssigneeUserId]: anotherAgentId,
                    },
                ],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        const { result } = renderHook(
            () =>
                useZeroTouchTicketsPercentageMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    missingAgentId,
                ),
            {},
        )

        expect(result.current).toEqual({
            data: {
                allData: [
                    {
                        [TicketDimension.AssigneeUserId]: agentId,
                        [TicketMeasure.TicketCount]: null,
                    },
                    {
                        [TicketDimension.AssigneeUserId]: anotherAgentId,
                        [TicketMeasure.TicketCount]: null,
                    },
                ],
                value: null,
                decile: 0,
            },
            isFetching: false,
            isError: false,
        })
    })
})
