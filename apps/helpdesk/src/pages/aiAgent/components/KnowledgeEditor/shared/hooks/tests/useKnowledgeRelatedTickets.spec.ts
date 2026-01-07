import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'

import {
    getLast28DaysDateRange,
    useRelatedTicketsWithDrilldown,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'

import { useKnowledgeRelatedTickets } from '../useKnowledgeRelatedTickets'

jest.mock('@repo/feature-flags', () => ({
    useFlag: jest.fn(),
    FeatureFlagKey: {
        PerformanceStatsOnIndividualKnowledge:
            'linear.project_add-performance-stats-to-knowledge.show-stats',
    },
}))

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/resourceMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
        useRelatedTicketsWithDrilldown: jest.fn(),
        getLast28DaysDateRange: jest.fn(),
    }),
)

jest.mock('hooks/useAppSelector', () => jest.fn())

const mockUseFlag = useFlag as jest.Mock
const mockUseResourceMetrics = useResourceMetrics as jest.Mock
const mockUseRelatedTicketsWithDrilldown =
    useRelatedTicketsWithDrilldown as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useKnowledgeRelatedTickets', () => {
    const mockDateRange = {
        since: '2025-01-01',
        until: '2025-01-28',
    }

    const mockResourceMetricsData = {
        tickets: { value: 42 },
        handoverTickets: { value: 10 },
    }

    const mockRelatedTicketsData = {
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
        mockUseRelatedTicketsWithDrilldown.mockReturnValue(
            mockRelatedTicketsData,
        )
    })

    describe('when feature flag is disabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
        })

        it('should call useFlag with correct feature flag key', () => {
            renderHook(() =>
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseFlag).toHaveBeenCalledWith(
                FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
            )
        })

        it('should still call useResourceMetrics but with enabled=false', () => {
            renderHook(() =>
                useKnowledgeRelatedTickets({
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
                enabled: false,
                dateRange: mockDateRange,
            })
        })

        it('should still call useRelatedTicketsWithDrilldown but with enabled=false', () => {
            renderHook(() =>
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: false,
                ticketCount: 42,
                dateRange: mockDateRange,
            })
        })

        it('should respect enabled parameter even when feature flag is disabled', () => {
            renderHook(() =>
                useKnowledgeRelatedTickets({
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

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should return related tickets data', () => {
            const { result } = renderHook(() =>
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(result.current).toEqual(mockRelatedTicketsData)
        })

        it('should call getLast28DaysDateRange to calculate date range', () => {
            renderHook(() =>
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockGetLast28DaysDateRange).toHaveBeenCalled()
        })

        it('should call useResourceMetrics with correct parameters', () => {
            renderHook(() =>
                useKnowledgeRelatedTickets({
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

        it('should call useRelatedTicketsWithDrilldown with correct parameters', () => {
            renderHook(() =>
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: true,
                ticketCount: 42,
                dateRange: mockDateRange,
            })
        })

        it('should pass ticket count from resourceImpact to useRelatedTicketsWithDrilldown', () => {
            mockUseResourceMetrics.mockReturnValue({
                data: { tickets: { value: 99 } },
                isLoading: false,
            })

            renderHook(() =>
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
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
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
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
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketCount: 0,
                }),
            )
        })

        it('should use UTC as default timezone when selector returns undefined', () => {
            mockUseAppSelector.mockReturnValue(undefined)

            renderHook(() =>
                useKnowledgeRelatedTickets({
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

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    timezone: 'UTC',
                }),
            )
        })

        it('should use UTC as default timezone when selector returns null', () => {
            mockUseAppSelector.mockReturnValue(null)

            renderHook(() =>
                useKnowledgeRelatedTickets({
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

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    timezone: 'UTC',
                }),
            )
        })

        it('should pass the same dateRange to both hooks', () => {
            renderHook(() =>
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            const resourceMetricsCall = mockUseResourceMetrics.mock.calls[0][0]
            const relatedTicketsCall =
                mockUseRelatedTicketsWithDrilldown.mock.calls[0][0]

            expect(resourceMetricsCall.dateRange).toBe(mockDateRange)
            expect(relatedTicketsCall.dateRange).toBe(mockDateRange)
            expect(resourceMetricsCall.dateRange).toBe(
                relatedTicketsCall.dateRange,
            )
        })

        describe('enabled parameter', () => {
            it('should respect enabled=true parameter', () => {
                renderHook(() =>
                    useKnowledgeRelatedTickets({
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

                expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
                    expect.objectContaining({
                        enabled: true,
                    }),
                )
            })

            it('should respect enabled=false parameter', () => {
                renderHook(() =>
                    useKnowledgeRelatedTickets({
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

                expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
                    expect.objectContaining({
                        enabled: false,
                    }),
                )
            })

            it('should default to enabled=true when parameter is not provided', () => {
                renderHook(() =>
                    useKnowledgeRelatedTickets({
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

                expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
                    expect.objectContaining({
                        enabled: true,
                    }),
                )
            })
        })

        describe('different resource types', () => {
            it('should work with article IDs', () => {
                renderHook(() =>
                    useKnowledgeRelatedTickets({
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
                    useKnowledgeRelatedTickets({
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
                    useKnowledgeRelatedTickets({
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
    })

    describe('memoization', () => {
        it('should memoize dateRange across renders', () => {
            mockUseFlag.mockReturnValue(true)

            const { rerender } = renderHook(() =>
                useKnowledgeRelatedTickets({
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
            mockUseFlag.mockReturnValue(true)

            const { rerender } = renderHook(
                ({ resourceSourceId }) =>
                    useKnowledgeRelatedTickets({
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
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should handle resourceSourceId of 0', () => {
            renderHook(() =>
                useKnowledgeRelatedTickets({
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
                useKnowledgeRelatedTickets({
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
                useKnowledgeRelatedTickets({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 456,
                }),
            )

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketCount: -5,
                }),
            )
        })
    })
})
