import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'
import moment from 'moment/moment'
import {FeatureFlagKey} from 'config/featureFlags'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'

import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {useClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {usePercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/usePercentageOfClosedTicketsMetricPerAgent'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'

jest.mock('hooks/reporting/metricsPerDimension')
jest.mock('hooks/reporting/metrics')
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent
)

describe('usePercentageOfClosedTicketsMetricPerAgent', () => {
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
    const closedTickets = 3200
    const ticketCount = 200

    it('should pass return percentage of closed tickets', () => {
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [{[TicketMeasure.TicketCount]: `${ticketCount}`}],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        useClosedTicketsMetricMock.mockReturnValue({
            data: {value: closedTickets},
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                usePercentageOfClosedTicketsMetricPerAgent(
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
                        [TicketMeasure.TicketCount]: `${
                            (ticketCount / closedTickets) * 100
                        }`,
                    },
                ],
                value: (ticketCount / closedTickets) * 100,
                decile: null,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should pass return percentage of closed tickets using New Cubes', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsNewCubes]: true,
        }))
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [
                    {
                        [renameMemberEnriched(
                            TicketMeasure.TicketCount
                        )]: `${ticketCount}`,
                    },
                ],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        useClosedTicketsMetricMock.mockReturnValue({
            data: {value: closedTickets},
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                usePercentageOfClosedTicketsMetricPerAgent(
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
                        [renameMemberEnriched(TicketMeasure.TicketCount)]: `${
                            (ticketCount / closedTickets) * 100
                        }`,
                    },
                ],
                value: (ticketCount / closedTickets) * 100,
                decile: null,
            },
            isFetching: false,
            isError: false,
        })
    })
})
