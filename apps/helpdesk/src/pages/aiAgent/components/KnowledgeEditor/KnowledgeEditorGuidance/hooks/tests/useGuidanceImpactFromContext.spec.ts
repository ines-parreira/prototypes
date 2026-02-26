import { renderHook } from '@testing-library/react'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import type { GuidanceContextValue } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/types'
import type { MetricProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import { useGuidanceContext, useGuidanceStore } from '../../context'
import { useGuidanceImpactFromContext } from '../useGuidanceImpactFromContext'

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
        getLast28DaysDateRange: jest.fn(),
    }),
)

jest.mock('hooks/useAppSelector', () => jest.fn())

jest.mock('../../context', () => ({
    useGuidanceContext: jest.fn(),
    useGuidanceStore: jest.fn(),
}))

const mockUseResourceMetrics = useResourceMetrics as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseGuidanceContext = useGuidanceContext as jest.Mock
const mockUseGuidanceStore = useGuidanceStore as jest.Mock

describe('useGuidanceImpactFromContext', () => {
    const mockGuidanceArticle: GuidanceArticle = {
        id: 123,
        title: 'Test Guidance',
        content: '<p>Test content</p>',
        locale: 'en-US',
        visibility: 'PUBLIC',
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        templateKey: null,
        isCurrent: true,
        draftVersionId: null,
        publishedVersionId: 1,
    }

    const defaultContextValue: Partial<GuidanceContextValue> = {
        guidanceArticle: mockGuidanceArticle,
        config: {
            guidanceHelpCenter: {
                id: 1,
                shop_integration_id: 456,
            },
        } as GuidanceContextValue['config'],
        state: {
            historicalVersion: null,
        } as GuidanceContextValue['state'],
    }

    const mockMetricsData = {
        tickets: { value: 10, onClick: undefined } as MetricProps,
        handoverTickets: { value: 5, onClick: undefined } as MetricProps,
        csat: { value: 4.5, onClick: undefined } as MetricProps,
        intents: [
            { intent: 'Intent 1', ticketCount: 10 },
            { intent: 'Intent 2', ticketCount: 5 },
        ],
    }

    const mockDateRange = {
        since: '2025-01-01',
        until: '2025-01-28',
    }

    const getStoreValue = () => {
        const contextValue = mockUseGuidanceContext()

        return {
            state: contextValue.state,
            config: contextValue.config,
            dispatch: contextValue.dispatch ?? jest.fn(),
            guidanceArticle:
                contextValue.guidanceArticle ?? contextValue.state?.guidance,
            playground: contextValue.playground ?? ({} as any),
            setConfig: jest.fn(),
            setGuidanceArticle: jest.fn(),
            setPlayground: jest.fn(),
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue('America/New_York')
        mockUseGuidanceContext.mockReturnValue(defaultContextValue)
        mockUseGuidanceStore.mockImplementation((selector) =>
            selector(getStoreValue()),
        )
        mockGetLast28DaysDateRange.mockReturnValue(mockDateRange)
        mockUseResourceMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
        })
    })

    it('should return guidance impact data', () => {
        const { result } = renderHook(() => useGuidanceImpactFromContext())

        expect(result.current).toEqual({
            tickets: mockMetricsData.tickets,
            handoverTickets: mockMetricsData.handoverTickets,
            csat: mockMetricsData.csat,
            intents: ['Intent 1', 'Intent 2'],
            isLoading: false,
            subtitle: 'Last 28 days',
        })
    })

    it('should call useResourceMetrics with enabled=true when guidanceArticle exists', () => {
        renderHook(() => useGuidanceImpactFromContext())

        expect(mockUseResourceMetrics).toHaveBeenCalledWith({
            resourceSourceId: 123,
            resourceSourceSetId: 1,
            shopIntegrationId: 456,
            timezone: 'America/New_York',
            enabled: true,
            dateRange: mockDateRange,
        })
    })

    it('should call useResourceMetrics with enabled=false when guidanceArticle is undefined', () => {
        mockUseGuidanceContext.mockReturnValue({
            ...defaultContextValue,
            guidanceArticle: undefined,
        })

        renderHook(() => useGuidanceImpactFromContext())

        expect(mockUseResourceMetrics).toHaveBeenCalledWith({
            resourceSourceId: 0,
            resourceSourceSetId: 1,
            shopIntegrationId: 456,
            timezone: 'America/New_York',
            enabled: false,
            dateRange: mockDateRange,
        })
    })

    it('should use UTC as default timezone when selector returns undefined', () => {
        mockUseAppSelector.mockReturnValue(undefined)

        renderHook(() => useGuidanceImpactFromContext())

        expect(mockUseResourceMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                timezone: 'UTC',
            }),
        )
    })

    it('should use 0 for shop_integration_id when not available', () => {
        mockUseGuidanceContext.mockReturnValue({
            ...defaultContextValue,
            config: {
                guidanceHelpCenter: {
                    id: 1,
                    shop_integration_id: null,
                },
            } as GuidanceContextValue['config'],
        })

        renderHook(() => useGuidanceImpactFromContext())

        expect(mockUseResourceMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                shopIntegrationId: 0,
            }),
        )
    })

    it('should return isLoading=true when metrics are loading', () => {
        mockUseResourceMetrics.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() => useGuidanceImpactFromContext())

        expect(result.current?.isLoading).toBe(true)
    })

    it('should return undefined for metrics when data is not available', () => {
        mockUseResourceMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(() => useGuidanceImpactFromContext())

        expect(result.current).toEqual({
            tickets: undefined,
            handoverTickets: undefined,
            csat: undefined,
            intents: undefined,
            isLoading: false,
            subtitle: 'Last 28 days',
        })
    })

    describe('historical version date range', () => {
        it('should use historicalVersion impactDateRange when viewing historical version', () => {
            const historicalDateRange = {
                start_datetime: '2024-06-01T00:00:00Z',
                end_datetime: '2024-07-15T00:00:00Z',
            }

            mockUseGuidanceContext.mockReturnValue({
                ...defaultContextValue,
                state: {
                    historicalVersion: {
                        versionId: 123,
                        version: 2,
                        title: 'Historical Title',
                        content: 'Historical Content',
                        publishedDatetime: '2024-06-01T00:00:00Z',
                        impactDateRange: historicalDateRange,
                    },
                } as GuidanceContextValue['state'],
            })

            renderHook(() => useGuidanceImpactFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateRange: historicalDateRange,
                }),
            )
            expect(mockGetLast28DaysDateRange).not.toHaveBeenCalled()
        })

        it('should use getLast28DaysDateRange when not viewing historical version', () => {
            renderHook(() => useGuidanceImpactFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateRange: mockDateRange,
                }),
            )
        })
    })

    describe('memoization', () => {
        it('should return same reference when dependencies do not change', () => {
            const { result, rerender } = renderHook(() =>
                useGuidanceImpactFromContext(),
            )

            const firstResult = result.current
            rerender()
            const secondResult = result.current

            expect(firstResult).toBe(secondResult)
        })

        it('should return new reference when resourceImpact changes', () => {
            const { result, rerender } = renderHook(() =>
                useGuidanceImpactFromContext(),
            )

            const firstResult = result.current

            mockUseResourceMetrics.mockReturnValue({
                data: {
                    ...mockMetricsData,
                    tickets: { value: 20, onClick: undefined },
                },
                isLoading: false,
            })

            rerender()
            const secondResult = result.current

            expect(firstResult).not.toBe(secondResult)
            expect(secondResult?.tickets?.value).toBe(20)
        })
    })
})
