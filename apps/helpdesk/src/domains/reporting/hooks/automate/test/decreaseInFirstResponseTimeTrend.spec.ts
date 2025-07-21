import { getDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
    fetchFirstResponseTimeExcludingAIAgent,
    fetchFirstResponseTimeIncludingAIAgent,
    useBillableTicketsExcludingAIAgent,
    useFilteredAutomatedInteractions,
    useFirstResponseTimeExcludingAIAgent,
    useFirstResponseTimeIncludingAIAgent,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchDecreaseInFirstResponseTimeTrend,
    useDecreaseInFirstResponseTimeTrend,
} from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/automate/automationTrends')
const useFilteredAutomatedInteractionsMock = assumeMock(
    useFilteredAutomatedInteractions,
)
const useBillableTicketsExcludingAIAgentMock = assumeMock(
    useBillableTicketsExcludingAIAgent,
)
const useFirstResponseTimeExcludingAIAgentMock = assumeMock(
    useFirstResponseTimeExcludingAIAgent,
)
const useFirstResponseTimeIncludingAIAgentMock = assumeMock(
    useFirstResponseTimeIncludingAIAgent,
)
const fetchFilteredAutomatedInteractionsMock = assumeMock(
    fetchFilteredAutomatedInteractions,
)
const fetchBillableTicketsExcludingAIAgentMock = assumeMock(
    fetchBillableTicketsExcludingAIAgent,
)
const fetchFirstResponseTimeExcludingAIAgentMock = assumeMock(
    fetchFirstResponseTimeExcludingAIAgent,
)
const fetchFirstResponseTimeIncludingAIAgentMock = assumeMock(
    fetchFirstResponseTimeIncludingAIAgent,
)

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)

describe('decreaseInFirstResponseTimeTrend', () => {
    const periodStart = '2021-05-29T00:00:00.000'
    const periodEnd = '2021-06-04T23:59:59.000'
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
        channels: withDefaultLogicalOperator(['email']),
    }
    const timezone = 'UTC'
    const aIAgentUserId = 4000
    const filteredAutomatedInteractions = {
        data: {
            value: 123,
            prevValue: 456,
        },
        isFetching: false,
        isError: false,
    }
    const billableTicketsExcludingAIAgent = {
        data: {
            value: 321,
            prevValue: 876,
        },
        isFetching: false,
        isError: false,
    }
    const firstResponseTimeExcludingAIAgent = {
        data: {
            value: 457,
            prevValue: 234,
        },
        isFetching: false,
        isError: false,
    }
    const firstResponseTimeIncludingAIAgent = {
        data: {
            value: 789,
            prevValue: 567,
        },
        isFetching: false,
        isError: false,
    }

    describe('useDecreaseInFirstResponseTimeTrend', () => {
        beforeEach(() => {
            useAIAgentUserIdMock.mockReturnValue(aIAgentUserId)
            useFilteredAutomatedInteractionsMock.mockReturnValue(
                filteredAutomatedInteractions,
            )
            useBillableTicketsExcludingAIAgentMock.mockReturnValue(
                billableTicketsExcludingAIAgent,
            )
            useFirstResponseTimeExcludingAIAgentMock.mockReturnValue(
                firstResponseTimeExcludingAIAgent,
            )
            useFirstResponseTimeIncludingAIAgentMock.mockReturnValue(
                firstResponseTimeIncludingAIAgent,
            )
        })

        it('should fetch data and format the response', () => {
            const { result } = renderHook(() =>
                useDecreaseInFirstResponseTimeTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual(
                getDecreaseInFirstResponseTimeTrend(
                    false,
                    false,
                    filteredAutomatedInteractions.data,
                    billableTicketsExcludingAIAgent.data,
                    firstResponseTimeExcludingAIAgent.data,
                    firstResponseTimeIncludingAIAgent.data,
                ),
            )
        })
    })

    describe('fetchDecreaseInFirstResponseTimeTrend', () => {
        beforeEach(() => {
            fetchFilteredAutomatedInteractionsMock.mockResolvedValue(
                filteredAutomatedInteractions,
            )
            fetchBillableTicketsExcludingAIAgentMock.mockResolvedValue(
                billableTicketsExcludingAIAgent,
            )
            fetchFirstResponseTimeExcludingAIAgentMock.mockResolvedValue(
                firstResponseTimeExcludingAIAgent,
            )
            fetchFirstResponseTimeIncludingAIAgentMock.mockResolvedValue(
                firstResponseTimeIncludingAIAgent,
            )
        })

        it('should fetch data and format the response', async () => {
            const result = await fetchDecreaseInFirstResponseTimeTrend(
                statsFilters,
                timezone,
                undefined,
                aIAgentUserId,
            )

            expect(result).toEqual(
                getDecreaseInFirstResponseTimeTrend(
                    false,
                    false,
                    filteredAutomatedInteractions.data,
                    billableTicketsExcludingAIAgent.data,
                    firstResponseTimeExcludingAIAgent.data,
                    firstResponseTimeIncludingAIAgent.data,
                ),
            )
        })
    })
})
