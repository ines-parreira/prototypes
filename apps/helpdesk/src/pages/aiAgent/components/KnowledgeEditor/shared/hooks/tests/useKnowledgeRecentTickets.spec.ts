import { renderHook } from '@testing-library/react'

import {
    getLast28DaysDateRange,
    useRecentTicketsWithDrilldown,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'

import { useKnowledgeRecentTickets } from '../useKnowledgeRecentTickets'

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
        useRecentTicketsWithDrilldown: jest.fn(),
        getLast28DaysDateRange: jest.fn(),
    }),
)

jest.mock('hooks/useAppSelector', () => jest.fn())

const mockUseResourceMetrics = useResourceMetrics as jest.Mock
const mockUseRecentTicketsWithDrilldown =
    useRecentTicketsWithDrilldown as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useKnowledgeRecentTickets', () => {
    const mockDateRange = {
        since: '2025-01-01',
        until: '2025-01-28',
    }

    const mockResourceMetricsData = {
        tickets: { value: 42 },
        handoverTickets: { value: 10 },
    }

    const mockRecentTicketsData = {
        tickets: [
            { id: 1, subject: 'Ticket 1' },
            { id: 2, subject: 'Ticket 2' },
        ],
        isLoading: false,
        error: null,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue('America/New_York')
        mockGetLast28DaysDateRange.mockReturnValue(mockDateRange)
        mockUseResourceMetrics.mockReturnValue({
            data: mockResourceMetricsData,
            isLoading: false,
        })
        mockUseRecentTicketsWithDrilldown.mockReturnValue(mockRecentTicketsData)
    })

    it('should return related tickets data', () => {
        const { result } = renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        expect(result.current).toEqual(mockRecentTicketsData)
    })

    it('should call getLast28DaysDateRange to calculate date range', () => {
        renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        expect(mockGetLast28DaysDateRange).toHaveBeenCalled()
    })

    it('should call useResourceMetrics with correct parameters', () => {
        renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        expect(mockUseResourceMetrics).toHaveBeenCalledWith({
            resourceSourceId: 123,
            resourceSourceSetId: 1,
            shopIntegrationId: 456,
            timezone: 'America/New_York',
            enabled: true,
            dateRange: mockDateRange,
        })
    })

    it('should call useRecentTicketsWithDrilldown with correct parameters', () => {
        renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith({
            resourceSourceId: 123,
            resourceSourceSetId: 1,
            shopIntegrationId: 456,
            timezone: 'America/New_York',
            enabled: true,
            ticketCount: 42,
            ticketCountIsLoading: false,
            dateRange: mockDateRange,
        })
    })

    it('should pass ticket count from resourceImpact to useRecentTicketsWithDrilldown', () => {
        mockUseResourceMetrics.mockReturnValue({
            data: { tickets: { value: 99 } },
            isLoading: false,
        })

        renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
            expect.objectContaining({
                ticketCount: 99,
            }),
        )
    })

    it('should use 0 as ticket count when resourceImpact has no tickets data', () => {
        mockUseResourceMetrics.mockReturnValue({
            data: {},
            isLoading: false,
        })

        renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
            expect.objectContaining({
                ticketCount: 0,
            }),
        )
    })

    it('should use 0 as ticket count when resourceImpact data is undefined', () => {
        mockUseResourceMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
            expect.objectContaining({
                ticketCount: 0,
            }),
        )
    })

    it('should use UTC as default timezone when selector returns undefined', () => {
        mockUseAppSelector.mockReturnValue(undefined)

        renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        expect(mockUseResourceMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                timezone: 'UTC',
            }),
        )

        expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
            expect.objectContaining({
                timezone: 'UTC',
            }),
        )
    })

    it('should use UTC as default timezone when selector returns null', () => {
        mockUseAppSelector.mockReturnValue(null)

        renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        expect(mockUseResourceMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                timezone: 'UTC',
            }),
        )

        expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
            expect.objectContaining({
                timezone: 'UTC',
            }),
        )
    })

    it('should pass the same dateRange to both hooks', () => {
        renderHook(() =>
            useKnowledgeRecentTickets({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 456,
            }),
        )

        const resourceMetricsCall = mockUseResourceMetrics.mock.calls[0][0]
        const recentTicketsCall =
            mockUseRecentTicketsWithDrilldown.mock.calls[0][0]

        expect(resourceMetricsCall.dateRange).toBe(mockDateRange)
        expect(recentTicketsCall.dateRange).toBe(mockDateRange)
        expect(resourceMetricsCall.dateRange).toBe(recentTicketsCall.dateRange)
    })

    describe('loading state coordination', () => {
        it('should pass resourceMetrics loading state to useRecentTicketsWithDrilldown', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: { tickets: { value: 42 } },
                isLoading: true,
            })

            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketCountIsLoading: true,
                }),
            )
        })

        it('should pass resourceMetrics not loading when complete', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: { tickets: { value: 42 } },
                isLoading: false,
            })

            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketCountIsLoading: false,
                }),
            )
        })

        it('should pass loading state even when resourceImpact data is undefined', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketCountIsLoading: true,
                    ticketCount: 0,
                }),
            )
        })
    })

    describe('enabled parameter', () => {
        it('should respect enabled=true parameter', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                    enabled: true,
                }),
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: true,
                }),
            )

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: true,
                }),
            )
        })

        it('should respect enabled=false parameter', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                    enabled: false,
                }),
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('should default to enabled=true when parameter is not provided', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: true,
                }),
            )

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: true,
                }),
            )
        })
    })

    describe('different resource types', () => {
        it('should work with article IDs', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 456,
                    resourceSourceSetId: 2,
                    shopIntegrationId: 789,
                }),
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    resourceSourceId: 456,
                    resourceSourceSetId: 2,
                }),
            )
        })

        it('should work with snippet IDs', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 789,
                    resourceSourceSetId: 3,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    resourceSourceId: 789,
                    resourceSourceSetId: 3,
                }),
            )
        })

        it('should work with guidance IDs', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 101,
                    resourceSourceSetId: 4,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    resourceSourceId: 101,
                    resourceSourceSetId: 4,
                }),
            )
        })
    })

    describe('when custom dateRange is provided', () => {
        const customDateRange = {
            start_datetime: '2025-03-01T00:00:00.000Z',
            end_datetime: '2025-03-15T00:00:00.000Z',
        }

        it('should not call getLast28DaysDateRange', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                    dateRange: customDateRange,
                }),
            )

            expect(mockGetLast28DaysDateRange).not.toHaveBeenCalled()
        })

        it('should pass the custom dateRange to useResourceMetrics', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                    dateRange: customDateRange,
                }),
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateRange: customDateRange,
                }),
            )
        })

        it('should pass the custom dateRange to useRecentTicketsWithDrilldown', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                    dateRange: customDateRange,
                }),
            )

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateRange: customDateRange,
                }),
            )
        })

        it('should pass the same custom dateRange to both hooks', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                    dateRange: customDateRange,
                }),
            )

            const resourceMetricsCall = mockUseResourceMetrics.mock.calls[0][0]
            const recentTicketsCall =
                mockUseRecentTicketsWithDrilldown.mock.calls[0][0]

            expect(resourceMetricsCall.dateRange).toBe(customDateRange)
            expect(recentTicketsCall.dateRange).toBe(customDateRange)
        })
    })

    describe('memoization', () => {
        it('should memoize dateRange across renders', () => {
            const { rerender } = renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            const firstCall = mockGetLast28DaysDateRange.mock.calls.length

            rerender()

            const secondCall = mockGetLast28DaysDateRange.mock.calls.length

            // getLast28DaysDateRange should only be called once due to useMemo
            expect(secondCall).toBe(firstCall)
        })

        it('should not recalculate dateRange when parameters change', () => {
            const { rerender } = renderHook(
                ({ resourceSourceId }) =>
                    useKnowledgeRecentTickets({
                        resourceSourceId,
                        resourceSourceSetId: 1,
                        shopIntegrationId: 456,
                    }),
                {
                    initialProps: { resourceSourceId: 123 },
                },
            )

            const firstCall = mockGetLast28DaysDateRange.mock.calls.length

            rerender({ resourceSourceId: 456 })

            const secondCall = mockGetLast28DaysDateRange.mock.calls.length

            // getLast28DaysDateRange should only be called once due to useMemo with empty deps
            expect(secondCall).toBe(firstCall)
        })
    })

    describe('edge cases', () => {
        it('should handle resourceSourceId of 0', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 0,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    resourceSourceId: 0,
                }),
            )
        })

        it('should handle resourceSourceSetId of 0', () => {
            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 0,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    resourceSourceSetId: 0,
                }),
            )
        })

        it('should handle negative ticket counts by defaulting to 0', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: { tickets: { value: -5 } },
                isLoading: false,
            })

            renderHook(() =>
                useKnowledgeRecentTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketCount: -5,
                }),
            )
        })
    })
})
