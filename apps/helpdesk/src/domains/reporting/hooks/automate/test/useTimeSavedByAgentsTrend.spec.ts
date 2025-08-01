import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import {
    fetchTimeSavedByAgentsTrend,
    useTimeSavedByAgentsTrend,
} from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import {
    fetchTicketHandleTimeTrend,
    useTicketHandleTimeTrend,
} from 'domains/reporting/hooks/metricTrends'
import { StatsFilters } from 'domains/reporting/models/stat/types'

jest.mock('domains/reporting/hooks/automate/automationTrends')
const useFilteredAutomatedInteractionsMock = assumeMock(
    useFilteredAutomatedInteractions,
)
const fetchFilteredAutomatedInteractionsMock = assumeMock(
    fetchFilteredAutomatedInteractions,
)

jest.mock('domains/reporting/hooks/metricTrends')
const useTicketHandleTimeTrendMock = assumeMock(useTicketHandleTimeTrend)
const fetchTicketHandleTimeTrendMock = assumeMock(fetchTicketHandleTimeTrend)

describe('TimeSavedByAgentsTrend', () => {
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

    describe('useTimeSavedByAgentsTrend', () => {
        beforeEach(() => {
            useFilteredAutomatedInteractionsMock.mockReturnValue({
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

        it('should fetch automatedInteractionTrend and TicketHandleTimeTrend and calculate result', () => {
            const { result } = renderHook(() =>
                useTimeSavedByAgentsTrend(statsFilters, 'UTC'),
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
            useFilteredAutomatedInteractionsMock.mockReturnValue({
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
                useTimeSavedByAgentsTrend(statsFilters, 'UTC'),
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

    describe('fetchTimeSavedByAgentsTrend', () => {
        beforeEach(() => {
            useFilteredAutomatedInteractionsMock.mockReturnValue({
                data: interactionsTrend,
                isFetching: false,
                isError: false,
            })
            fetchFilteredAutomatedInteractionsMock.mockResolvedValue({
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

        it('should fetch automatedInteractionTrend and TicketHandleTimeTrend and calculate result', async () => {
            const result = await fetchTimeSavedByAgentsTrend(
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
