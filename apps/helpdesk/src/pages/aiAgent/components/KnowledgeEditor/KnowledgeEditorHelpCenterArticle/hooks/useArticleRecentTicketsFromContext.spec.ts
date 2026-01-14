import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'

import {
    getLast28DaysDateRange,
    useRecentTicketsWithDrilldown,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context/ArticleContext'
import type { ArticleContextValue } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context/types'

import { useArticleRecentTicketsFromContext } from './useArticleRecentTicketsFromContext'

jest.mock('@repo/feature-flags', () => ({
    useFlag: jest.fn(),
    FeatureFlagKey: {
        PerformanceStatsOnIndividualKnowledge:
            'linear.project_add-performance-stats-to-knowledge.show-stats',
    },
}))

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
        useRecentTicketsWithDrilldown: jest.fn(),
        getLast28DaysDateRange: jest.fn(),
    }),
)

jest.mock('hooks/useAppSelector', () => jest.fn())

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context/ArticleContext',
    () => ({
        useArticleContext: jest.fn(),
    }),
)

const mockUseFlag = useFlag as jest.Mock
const mockUseResourceMetrics = useResourceMetrics as jest.Mock
const mockUseRecentTicketsWithDrilldown =
    useRecentTicketsWithDrilldown as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useArticleRecentTicketsFromContext', () => {
    const mockArticle = {
        id: 123,
        translation: {
            title: 'Test Article',
            content: '<p>Test content</p>',
        },
    }

    const defaultContextValue: Partial<ArticleContextValue> = {
        state: {
            article: mockArticle,
            articleMode: 'edit',
            isFullscreen: false,
            isDetailsView: true,
            title: 'Test Article',
            content: '<p>Test content</p>',
            savedSnapshot: {
                title: 'Test Article',
                content: '<p>Test content</p>',
            },
            isAutoSaving: false,
            translationMode: 'existing',
            currentLocale: 'en-US',
            pendingSettingsChanges: {},
            versionStatus: 'latest_draft',
            activeModal: null,
            isUpdating: false,
            templateKey: undefined,
        } as ArticleContextValue['state'],
        config: {
            helpCenter: { id: 1, shop_integration_id: 0 },
        } as ArticleContextValue['config'],
    }

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
        mockUseArticleContext.mockReturnValue(defaultContextValue)
        mockGetLast28DaysDateRange.mockReturnValue(mockDateRange)
        mockUseResourceMetrics.mockReturnValue({
            data: mockResourceMetricsData,
            isLoading: false,
        })
        mockUseRecentTicketsWithDrilldown.mockReturnValue(mockRecentTicketsData)
    })

    describe('when feature flag is disabled', () => {
        it('should still call useResourceMetrics but with enabled=false', () => {
            mockUseFlag.mockReturnValue(false)

            renderHook(() => useArticleRecentTicketsFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 0,
                timezone: 'America/New_York',
                enabled: false,
                dateRange: mockDateRange,
            })
        })

        it('should still call useRecentTicketsWithDrilldown but with enabled=false', () => {
            mockUseFlag.mockReturnValue(false)

            renderHook(() => useArticleRecentTicketsFromContext())

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 0,
                timezone: 'America/New_York',
                enabled: false,
                ticketCount: 42,
                ticketCountIsLoading: false,
                dateRange: mockDateRange,
            })
        })
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should return related tickets data', () => {
            const { result } = renderHook(() =>
                useArticleRecentTicketsFromContext(),
            )

            expect(result.current).toEqual(mockRecentTicketsData)
        })

        it('should call useFlag with correct feature flag key', () => {
            renderHook(() => useArticleRecentTicketsFromContext())

            expect(mockUseFlag).toHaveBeenCalledWith(
                FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
            )
        })

        it('should call getLast28DaysDateRange to calculate date range', () => {
            renderHook(() => useArticleRecentTicketsFromContext())

            expect(mockGetLast28DaysDateRange).toHaveBeenCalled()
        })

        it('should call useResourceMetrics with enabled=true when article exists', () => {
            renderHook(() => useArticleRecentTicketsFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 0,
                timezone: 'America/New_York',
                enabled: true,
                dateRange: mockDateRange,
            })
        })

        it('should call useRecentTicketsWithDrilldown with enabled=true when article exists', () => {
            renderHook(() => useArticleRecentTicketsFromContext())

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                shopIntegrationId: 0,
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

            renderHook(() => useArticleRecentTicketsFromContext())

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

            renderHook(() => useArticleRecentTicketsFromContext())

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

            renderHook(() => useArticleRecentTicketsFromContext())

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticketCount: 0,
                }),
            )
        })

        it('should call hooks with enabled=false when article is undefined', () => {
            mockUseArticleContext.mockReturnValue({
                ...defaultContextValue,
                state: {
                    ...defaultContextValue.state,
                    article: undefined,
                },
            })

            renderHook(() => useArticleRecentTicketsFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 0,
                resourceSourceSetId: 1,
                shopIntegrationId: 0,
                timezone: 'America/New_York',
                enabled: false,
                dateRange: mockDateRange,
            })

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith({
                resourceSourceId: 0,
                resourceSourceSetId: 1,
                shopIntegrationId: 0,
                timezone: 'America/New_York',
                enabled: false,
                ticketCount: 42,
                ticketCountIsLoading: false,
                dateRange: mockDateRange,
            })
        })

        it('should use UTC as default timezone when selector returns undefined', () => {
            mockUseAppSelector.mockReturnValue(undefined)

            renderHook(() => useArticleRecentTicketsFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    resourceSourceId: 123,
                    resourceSourceSetId: 1,
                    shopIntegrationId: 0,
                    timezone: 'UTC',
                    enabled: true,
                    dateRange: mockDateRange,
                }),
            )

            expect(mockUseRecentTicketsWithDrilldown).toHaveBeenCalledWith(
                expect.objectContaining({
                    timezone: 'UTC',
                }),
            )
        })

        it('should pass the same dateRange to both hooks', () => {
            renderHook(() => useArticleRecentTicketsFromContext())

            const resourceMetricsCall = mockUseResourceMetrics.mock.calls[0][0]
            const recentTicketsCall =
                mockUseRecentTicketsWithDrilldown.mock.calls[0][0]

            expect(resourceMetricsCall.dateRange).toBe(mockDateRange)
            expect(recentTicketsCall.dateRange).toBe(mockDateRange)
            expect(resourceMetricsCall.dateRange).toBe(
                recentTicketsCall.dateRange,
            )
        })
    })

    describe('memoization', () => {
        it('should memoize dateRange across renders', () => {
            mockUseFlag.mockReturnValue(true)

            const { rerender } = renderHook(() =>
                useArticleRecentTicketsFromContext(),
            )

            const firstCall = mockGetLast28DaysDateRange.mock.calls.length

            rerender()

            const secondCall = mockGetLast28DaysDateRange.mock.calls.length

            // getLast28DaysDateRange should only be called once due to useMemo
            expect(secondCall).toBe(firstCall)
        })
    })
})
