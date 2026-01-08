import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import moment from 'moment/moment'

import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
    fetchFilteredAutomatedInteractionsByAutoResponders,
    fetchFirstResponseTimeExcludingAIAgent,
    fetchFirstResponseTimeIncludingAIAgent,
    fetchResolutionTimeExcludingAIAgent,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchAutomationRateTrend,
    useAutomationRateTrend,
} from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')

const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)
const getNewStatsFeatureFlagMigrationMock = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const useGetNewStatsFeatureFlagMigrationMock = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

jest.mock('domains/reporting/hooks/automate/automationTrends')
const fetchFilteredAutomatedInteractionsMock = assumeMock(
    fetchFilteredAutomatedInteractions,
)
const fetchAllAutomatedInteractionsByAutoRespondersMock = assumeMock(
    fetchAllAutomatedInteractionsByAutoResponders,
)
const fetchAllAutomatedInteractionsMock = assumeMock(
    fetchAllAutomatedInteractions,
)
const fetchBillableTicketsExcludingAIAgentMock = assumeMock(
    fetchBillableTicketsExcludingAIAgent,
)
const fetchFilteredAutomatedInteractionsByAutoRespondersMock = assumeMock(
    fetchFilteredAutomatedInteractionsByAutoResponders,
)
const fetchFirstResponseTimeExcludingAIAgentMock = assumeMock(
    fetchFirstResponseTimeExcludingAIAgent,
)
const fetchFirstResponseTimeIncludingAIAgentMock = assumeMock(
    fetchFirstResponseTimeIncludingAIAgent,
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
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue('off')
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

        it('should fetch and format data with a hook', async () => {
            const { result } = renderHook(() =>
                useAutomationRateTrend(statsFilters, timezone),
            )

            await waitFor(() => {
                expect(result.current.isFetching).toBeFalsy()
            })

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
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('off')
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

        it('should calculate data with NonFilteredDenominator', async () => {
            const result = await fetchAutomationRateTrend(
                statsFilters,
                timezone,
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
