import { mockFlags } from 'jest-launchdarkly-mock'
import moment from 'moment/moment'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
    fetchFilteredAutomatedInteractionsByAutoResponders,
    fetchFirstResponseTimeExcludingAIAgent,
    fetchFirstResponseTimeIncludingAIAgent,
    fetchResolutionTimeExcludingAIAgent,
    useAllAutomatedInteractions,
    useAllAutomatedInteractionsByAutoResponders,
    useBillableTicketsExcludingAIAgent,
    useFilteredAutomatedInteractions,
    useFilteredAutomatedInteractionsByAutoResponders,
    useFirstResponseTimeExcludingAIAgent,
    useFirstResponseTimeIncludingAIAgent,
    useResolutionTimeExcludingAIAgent,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchAutomationRateTrend,
    useAutomationRateTrend,
} from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)

jest.mock('domains/reporting/hooks/automate/automationTrends')
const useFilteredAutomatedInteractionsMock = assumeMock(
    useFilteredAutomatedInteractions,
)
const fetchFilteredAutomatedInteractionsMock = assumeMock(
    fetchFilteredAutomatedInteractions,
)
const useAllAutomatedInteractionsByAutoRespondersMock = assumeMock(
    useAllAutomatedInteractionsByAutoResponders,
)
const fetchAllAutomatedInteractionsByAutoRespondersMock = assumeMock(
    fetchAllAutomatedInteractionsByAutoResponders,
)
const useAllAutomatedInteractionsMock = assumeMock(useAllAutomatedInteractions)
const fetchAllAutomatedInteractionsMock = assumeMock(
    fetchAllAutomatedInteractions,
)
const useBillableTicketsExcludingAIAgentMock = assumeMock(
    useBillableTicketsExcludingAIAgent,
)
const fetchBillableTicketsExcludingAIAgentMock = assumeMock(
    fetchBillableTicketsExcludingAIAgent,
)
const useFilteredAutomatedInteractionsByAutoRespondersMock = assumeMock(
    useFilteredAutomatedInteractionsByAutoResponders,
)
const fetchFilteredAutomatedInteractionsByAutoRespondersMock = assumeMock(
    fetchFilteredAutomatedInteractionsByAutoResponders,
)
const useFirstResponseTimeExcludingAIAgentMock = assumeMock(
    useFirstResponseTimeExcludingAIAgent,
)
const fetchFirstResponseTimeExcludingAIAgentMock = assumeMock(
    fetchFirstResponseTimeExcludingAIAgent,
)
const useFirstResponseTimeIncludingAIAgentMock = assumeMock(
    useFirstResponseTimeIncludingAIAgent,
)
const fetchFirstResponseTimeIncludingAIAgentMock = assumeMock(
    fetchFirstResponseTimeIncludingAIAgent,
)
const useResolutionTimeExcludingAIAgentMock = assumeMock(
    useResolutionTimeExcludingAIAgent,
)
const fetchResolutionTimeExcludingAIAgentMock = assumeMock(
    fetchResolutionTimeExcludingAIAgent,
)

describe('AutomationRateTrend', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: moment()
                .add(1 * 7, 'day')
                .format('YYYY-MM-DDT00:00:00.000'),
            end_datetime: moment()
                .add(3 * 7, 'day')
                .format('YYYY-MM-DDT23:50:59.999'),
        },
    }
    const timezone = 'UTC'
    const aiAgentUserId = 4000

    const filteredAutomatedInteractions = {
        value: 10021,
        prevValue: 0,
    }
    const allAutomatedInteractionsData = {
        value: 10021,
        prevValue: 0,
    }
    const allAutomatedInteractionsByAutoRespondersData = {
        value: 1108,
        prevValue: 0,
    }
    const BillableTicketsExcludingAIAgent = {
        value: 4889,
        prevValue: 2,
    }
    const filteredAutomatedInteractionsDataByAutoResponders = {
        value: 1108,
        prevValue: 0,
    }
    const ticketDatasetExcludingAIAgent = {
        value: 5220830659,
        prevValue: 7200,
    }
    const ticketDatasetIncludingAIAgent = {
        value: 5220830659,
        prevValue: 7200,
    }
    const resolutionTimeExcludingAIAgent = {
        value: 14048308139,
        prevValue: 142113600,
    }

    describe('useAutomationRateTrend', () => {
        beforeEach(() => {
            useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
            useFilteredAutomatedInteractionsMock.mockReturnValue({
                data: filteredAutomatedInteractions,
                isFetching: false,
                isFetched: true,
                isError: false,
            } as any)
            useAllAutomatedInteractionsByAutoRespondersMock.mockReturnValue({
                data: allAutomatedInteractionsByAutoRespondersData,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
            useAllAutomatedInteractionsMock.mockReturnValue({
                data: allAutomatedInteractionsData,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
            useBillableTicketsExcludingAIAgentMock.mockReturnValue({
                data: BillableTicketsExcludingAIAgent,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
            useFilteredAutomatedInteractionsByAutoRespondersMock.mockReturnValue(
                {
                    data: filteredAutomatedInteractionsDataByAutoResponders,
                    isFetching: false,
                    isFetched: true,
                    isError: false,
                } as any,
            )
            useFirstResponseTimeExcludingAIAgentMock.mockReturnValue({
                data: ticketDatasetExcludingAIAgent,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
            useFirstResponseTimeIncludingAIAgentMock.mockReturnValue({
                data: ticketDatasetIncludingAIAgent,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
            useResolutionTimeExcludingAIAgentMock.mockReturnValue({
                data: resolutionTimeExcludingAIAgent,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
        })

        it('should fetch and format data with a hook', () => {
            const { result } = renderHook(() =>
                useAutomationRateTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                data: {
                    value: 0.7260541950441965,
                    prevValue: 0,
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should calculate data with NonFilteredDenominator when the flag is on', () => {
            mockFlags({
                [FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate]: true,
            })
            const { result } = renderHook(() =>
                useAutomationRateTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                data: {
                    value: 0.7260541950441965,
                    prevValue: 0,
                },
                isFetching: false,
                isError: false,
            })
        })
    })

    describe('fetchAutomationRateTrend', () => {
        beforeEach(() => {
            fetchFilteredAutomatedInteractionsMock.mockResolvedValue({
                data: filteredAutomatedInteractions,
                isFetching: false,
                isFetched: true,
                isError: false,
            } as any)
            fetchAllAutomatedInteractionsByAutoRespondersMock.mockResolvedValue(
                {
                    data: allAutomatedInteractionsByAutoRespondersData,
                    isFetched: true,
                    isFetching: false,
                    isError: false,
                } as any,
            )
            fetchAllAutomatedInteractionsMock.mockResolvedValue({
                data: allAutomatedInteractionsData,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
            fetchBillableTicketsExcludingAIAgentMock.mockResolvedValue({
                data: BillableTicketsExcludingAIAgent,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
            fetchFilteredAutomatedInteractionsByAutoRespondersMock.mockResolvedValue(
                {
                    data: filteredAutomatedInteractionsDataByAutoResponders,
                    isFetching: false,
                    isFetched: true,
                    isError: false,
                } as any,
            )
            fetchFirstResponseTimeExcludingAIAgentMock.mockResolvedValue({
                data: ticketDatasetExcludingAIAgent,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
            fetchFirstResponseTimeIncludingAIAgentMock.mockResolvedValue({
                data: ticketDatasetIncludingAIAgent,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
            fetchResolutionTimeExcludingAIAgentMock.mockResolvedValue({
                data: resolutionTimeExcludingAIAgent,
                isFetched: true,
                isFetching: false,
                isError: false,
            } as any)
        })

        it('should fetch and format data with a fetch method', async () => {
            const result = await fetchAutomationRateTrend(
                statsFilters,
                timezone,
                false,
                aiAgentUserId,
            )

            expect(result).toEqual({
                data: {
                    value: 0.7260541950441965,
                    prevValue: 0,
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should calculate data with NonFilteredDenominator when the flag is on', async () => {
            const result = await fetchAutomationRateTrend(
                statsFilters,
                timezone,
                true,
                aiAgentUserId,
            )

            expect(result).toEqual({
                data: {
                    value: 0.7260541950441965,
                    prevValue: 0,
                },
                isFetching: false,
                isError: false,
            })
        })
    })
})
