import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'
import moment from 'moment/moment'
import {FeatureFlagKey} from 'config/featureFlags'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'
import {calculateDecile} from 'hooks/reporting/useCustomFieldsTicketCountPerCustomFields'

import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'
import {
    useClosedTicketsMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {useOneTouchTicketsPercentageMetricPerAgent} from 'hooks/reporting/useOneTouchTicketsPercentageMetricPerAgent'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'

jest.mock('hooks/reporting/metricsPerDimension')
const useOneTouchTicketsMetricPerAgentMock = assumeMock(
    useOneTouchTicketsMetricPerAgent
)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent
)

describe('useOneTouchTicketsPercentageMetricPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
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

        const {result} = renderHook(
            () =>
                useOneTouchTicketsPercentageMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId
                ),
            {}
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

        const {result} = renderHook(
            () =>
                useOneTouchTicketsPercentageMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    missingAgentId
                ),
            {}
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

        const {result} = renderHook(
            () =>
                useOneTouchTicketsPercentageMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    missingAgentId
                ),
            {}
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

    it('should work with Enriched Cubes', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsNewCubes]: true,
        }))

        const ticketCountField = renameMemberEnriched(TicketMeasure.TicketCount)
        const ticketAssigneeField = renameMemberEnriched(
            TicketDimension.AssigneeUserId
        )

        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [ticketCountField]: `${closedTickets}`,
                        [ticketAssigneeField]: agentId,
                    },
                    {
                        [ticketCountField]: `${anotherAgentsClosedTickets}`,
                        [ticketAssigneeField]: anotherAgentId,
                    },
                    {
                        [ticketCountField]: `${incompleteDataAgentClosedTickets}`,
                        [ticketAssigneeField]: incompleteDataAgentId,
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
                        [ticketCountField]: `${ticketCount}`,
                        [ticketAssigneeField]: agentId,
                    },
                    {
                        [ticketCountField]: `${anotherAgentsTicketCount}`,
                        [ticketAssigneeField]: anotherAgentId,
                    },
                ],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                useOneTouchTicketsPercentageMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId
                ),
            {}
        )

        expect(result.current).toEqual({
            data: {
                allData: [
                    {
                        [ticketAssigneeField]: agentId,
                        [ticketCountField]: `${
                            (ticketCount / closedTickets) * 100
                        }`,
                    },
                    {
                        [ticketAssigneeField]: anotherAgentId,
                        [ticketCountField]: `${
                            (anotherAgentsTicketCount /
                                anotherAgentsClosedTickets) *
                            100
                        }`,
                    },
                ],
                value: (ticketCount / closedTickets) * 100,
                decile: calculateDecile(
                    (ticketCount / closedTickets) * 100,
                    (anotherAgentsTicketCount / anotherAgentsClosedTickets) *
                        100
                ),
            },
            isFetching: false,
            isError: false,
        })
    })
})
