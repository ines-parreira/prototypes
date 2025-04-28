import { getDecreaseInFirstResponseTimeTrend } from 'hooks/reporting/automate/automateStatsCalculatedTrends'
import {
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
    fetchResolutionTimeExcludingAIAgent,
    fetchResolutionTimeResolvedByAIAgent,
    useBillableTicketsExcludingAIAgent,
    useFilteredAutomatedInteractions,
    useResolutionTimeExcludingAIAgent,
    useResolutionTimeResolvedByAIAgent,
} from 'hooks/reporting/automate/automationTrends'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import {
    fetchDecreaseInResolutionTimeTrend,
    useDecreaseInResolutionTimeTrend,
} from 'hooks/reporting/automate/useDecreaseInResolutionTimeTrend'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters } from 'models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/automate/automationTrends')
const useFilteredAutomatedInteractionsMock = assumeMock(
    useFilteredAutomatedInteractions,
)
const useBillableTicketsExcludingAIAgentMock = assumeMock(
    useBillableTicketsExcludingAIAgent,
)
const useResolutionTimeExcludingAIAgentMock = assumeMock(
    useResolutionTimeExcludingAIAgent,
)
const useResolutionTimeResolvedByAIAgentMock = assumeMock(
    useResolutionTimeResolvedByAIAgent,
)
const fetchFilteredAutomatedInteractionsMock = assumeMock(
    fetchFilteredAutomatedInteractions,
)
const fetchBillableTicketsExcludingAIAgentMock = assumeMock(
    fetchBillableTicketsExcludingAIAgent,
)
const fetchResolutionTimeExcludingAIAgentMock = assumeMock(
    fetchResolutionTimeExcludingAIAgent,
)
const fetchResolutionTimeResolvedByAIAgentMock = assumeMock(
    fetchResolutionTimeResolvedByAIAgent,
)

jest.mock('hooks/reporting/automate/useAIAgentUserId')
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
    const aIAgentUserId = '4000'
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
    const resolutionTimeExcludingAIAgent = {
        data: {
            value: 457,
            prevValue: 234,
        },
        isFetching: false,
        isError: false,
    }
    const resolutionTimeIncludingAIAgent = {
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
            useResolutionTimeExcludingAIAgentMock.mockReturnValue(
                resolutionTimeExcludingAIAgent,
            )
            useResolutionTimeResolvedByAIAgentMock.mockReturnValue(
                resolutionTimeIncludingAIAgent,
            )
        })
        it('should fetch data and format the response', () => {
            const { result } = renderHook(() =>
                useDecreaseInResolutionTimeTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual(
                getDecreaseInFirstResponseTimeTrend(
                    false,
                    false,
                    filteredAutomatedInteractions.data,
                    billableTicketsExcludingAIAgent.data,
                    resolutionTimeExcludingAIAgent.data,
                    resolutionTimeIncludingAIAgent.data,
                ),
            )
        })
    })

    describe('fetchDecreaseInResolutionTimeTrend', () => {
        beforeEach(() => {
            fetchFilteredAutomatedInteractionsMock.mockResolvedValue(
                filteredAutomatedInteractions,
            )
            fetchBillableTicketsExcludingAIAgentMock.mockResolvedValue(
                billableTicketsExcludingAIAgent,
            )
            fetchResolutionTimeExcludingAIAgentMock.mockResolvedValue(
                resolutionTimeExcludingAIAgent,
            )
            fetchResolutionTimeResolvedByAIAgentMock.mockResolvedValue(
                resolutionTimeIncludingAIAgent,
            )
        })

        it('should fetch data and format the response', async () => {
            const result = await fetchDecreaseInResolutionTimeTrend(
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
                    resolutionTimeExcludingAIAgent.data,
                    resolutionTimeIncludingAIAgent.data,
                ),
            )
        })
    })
})
