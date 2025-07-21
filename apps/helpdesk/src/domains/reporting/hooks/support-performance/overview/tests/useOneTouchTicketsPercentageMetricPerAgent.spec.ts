import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchClosedTicketsMetricPerAgent,
    fetchOneTouchTicketsMetricPerAgent,
    useClosedTicketsMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import {
    fetchOneTouchTicketsPercentageMetricPerAgent,
    useOneTouchTicketsPercentageMetricPerAgent,
} from 'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/metricsPerAgent')
const useOneTouchTicketsMetricPerAgentMock = assumeMock(
    useOneTouchTicketsMetricPerAgent,
)
const fetchOneTouchTicketsMetricPerAgentMock = assumeMock(
    fetchOneTouchTicketsMetricPerAgent,
)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent,
)
const fetchClosedTicketsMetricPerAgentMock = assumeMock(
    fetchClosedTicketsMetricPerAgent,
)

describe('OneTouchTicketsPercentageMetricPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([
            TicketChannel.Email,
            TicketChannel.Chat,
        ]),
        integrations: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
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

    describe('useOneTouchTicketsPercentageMetricPerAgent', () => {
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
                            [TicketDimension.AssigneeUserId]:
                                incompleteDataAgentId,
                        },
                    ],
                    value: closedTickets,
                    decile: null,
                },
                isError: false,
                isFetching: false,
            })

            useOneTouchTicketsMetricPerAgentMock.mockReturnValue({
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
                    useOneTouchTicketsPercentageMetricPerAgent(
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

            useOneTouchTicketsMetricPerAgentMock.mockReturnValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            const { result } = renderHook(
                () =>
                    useOneTouchTicketsPercentageMetricPerAgent(
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

            useOneTouchTicketsMetricPerAgentMock.mockReturnValue({
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
                    useOneTouchTicketsPercentageMetricPerAgent(
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

    describe('fetchOneTouchTicketsPercentageMetricPerAgent', () => {
        it('should return percentage of one touch tickets', async () => {
            fetchClosedTicketsMetricPerAgentMock.mockResolvedValue({
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
                            [TicketDimension.AssigneeUserId]:
                                incompleteDataAgentId,
                        },
                    ],
                    value: closedTickets,
                    decile: null,
                },
                isError: false,
                isFetching: false,
            })

            fetchOneTouchTicketsMetricPerAgentMock.mockResolvedValue({
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

            const result = await fetchOneTouchTicketsPercentageMetricPerAgent(
                statsFilters,
                timezone,
                sorting,
                agentId,
            )

            expect(result).toEqual({
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

        it('should return null when no data is available', async () => {
            const missingAgentId = '567'
            fetchClosedTicketsMetricPerAgentMock.mockResolvedValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            fetchOneTouchTicketsMetricPerAgentMock.mockResolvedValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            const result = await fetchOneTouchTicketsPercentageMetricPerAgent(
                statsFilters,
                timezone,
                sorting,
                missingAgentId,
            )

            expect(result).toEqual({
                data: {
                    allData: [],
                    value: null,
                    decile: -0,
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should return null when no data on error', async () => {
            const missingAgentId = '567'
            fetchClosedTicketsMetricPerAgentMock.mockRejectedValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            fetchOneTouchTicketsMetricPerAgentMock.mockRejectedValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            const result = await fetchOneTouchTicketsPercentageMetricPerAgent(
                statsFilters,
                timezone,
                sorting,
                missingAgentId,
            )

            expect(result).toEqual({
                data: null,
                isFetching: false,
                isError: true,
            })
        })

        it('should return null when partial data is available', async () => {
            const missingAgentId = '567'
            fetchClosedTicketsMetricPerAgentMock.mockResolvedValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            fetchOneTouchTicketsMetricPerAgentMock.mockResolvedValue({
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

            const result = await fetchOneTouchTicketsPercentageMetricPerAgent(
                statsFilters,
                timezone,
                sorting,
                missingAgentId,
            )

            expect(result).toEqual({
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
})
