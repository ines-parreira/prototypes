import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAIAgentAutomatedInteractionsTrend,
    useAIAgentAutomatedInteractionsTrend,
} from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import {
    fetchAiAgentTimeSavedByAgentsTrend,
    useAiAgentTimeSavedByAgentsTrend,
} from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import {
    fetchTicketHandleTimeTrend,
    useTicketHandleTimeTrend,
} from 'domains/reporting/hooks/metricTrends'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

jest.mock(
    'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend',
)
const useAIAgentAutomatedInteractionsTrendMock = assumeMock(
    useAIAgentAutomatedInteractionsTrend,
)
const fetchAIAgentAutomatedInteractionsTrendMock = assumeMock(
    fetchAIAgentAutomatedInteractionsTrend,
)

jest.mock('domains/reporting/hooks/metricTrends')
const useTicketHandleTimeTrendMock = assumeMock(useTicketHandleTimeTrend)
const fetchTicketHandleTimeTrendMock = assumeMock(fetchTicketHandleTimeTrend)

describe('AiAgentTimeSavedByAgentsTrend', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2020-01-01',
            end_datetime: '2020-01-01',
        },
    }
    const interactionsTrend = {
        value: 123,
        prevValue: 456,
    }
    const ticketHandleTime = {
        value: 123,
        prevValue: 456,
    }

    describe('useAiAgentTimeSavedByAgentsTrend', () => {
        beforeEach(() => {
            useAIAgentAutomatedInteractionsTrendMock.mockReturnValue({
                data: interactionsTrend,
                isFetching: false,
                isError: false,
            })
            useTicketHandleTimeTrendMock.mockReturnValue({
                data: ticketHandleTime,
                isFetching: false,
                isError: false,
            })
        })

        it('should fetch aiAgentAutomatedInteractionTrend and TicketHandleTimeTrend and calculate result', () => {
            const { result } = renderHook(() =>
                useAiAgentTimeSavedByAgentsTrend(statsFilters, 'UTC'),
            )

            expect(result.current).toEqual({
                data: {
                    value: ticketHandleTime.value * interactionsTrend.value,
                    prevValue:
                        ticketHandleTime.prevValue *
                        interactionsTrend.prevValue,
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should return 0s when no data', () => {
            useAIAgentAutomatedInteractionsTrendMock.mockReturnValue({
                data: {
                    value: null,
                    prevValue: null,
                },
                isFetching: false,
                isError: false,
            })
            useTicketHandleTimeTrendMock.mockReturnValue({
                data: {
                    value: null,
                    prevValue: null,
                },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentTimeSavedByAgentsTrend(statsFilters, 'UTC'),
            )

            expect(result.current).toEqual({
                data: {
                    value: 0,
                    prevValue: 0,
                },
                isFetching: false,
                isError: false,
            })
        })
    })

    describe('fetchAiAgentTimeSavedByAgentsTrend', () => {
        beforeEach(() => {
            useAIAgentAutomatedInteractionsTrendMock.mockReturnValue({
                data: interactionsTrend,
                isFetching: false,
                isError: false,
            })
            fetchAIAgentAutomatedInteractionsTrendMock.mockResolvedValue({
                data: interactionsTrend,
                isFetching: false,
                isError: false,
            })
            useTicketHandleTimeTrendMock.mockReturnValue({
                data: ticketHandleTime,
                isFetching: false,
                isError: false,
            })
            fetchTicketHandleTimeTrendMock.mockResolvedValue({
                data: ticketHandleTime,
                isFetching: false,
                isError: false,
            })
        })

        it('should fetch aiAgentAutomatedInteractionTrend and TicketHandleTimeTrend and calculate result', async () => {
            const result = await fetchAiAgentTimeSavedByAgentsTrend(
                statsFilters,
                'UTC',
            )

            expect(result).toEqual({
                data: {
                    value: ticketHandleTime.value * interactionsTrend.value,
                    prevValue:
                        ticketHandleTime.prevValue *
                        interactionsTrend.prevValue,
                },
                isFetching: false,
                isError: false,
            })
        })
    })
})
