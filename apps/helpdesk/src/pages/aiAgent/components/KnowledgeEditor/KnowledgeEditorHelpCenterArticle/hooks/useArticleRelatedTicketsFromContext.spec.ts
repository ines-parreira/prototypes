import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'

import {
    getLast28DaysDateRange,
    useRelatedTicketsWithDrilldown,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context/ArticleContext'
import type { ArticleContextValue } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context/types'

import { useArticleRelatedTicketsFromContext } from './useArticleRelatedTicketsFromContext'

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

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context/ArticleContext',
    () => ({
        useArticleContext: jest.fn(),
    }),
)

const mockUseFlag = useFlag as jest.Mock
const mockUseResourceMetrics = useResourceMetrics as jest.Mock
const mockUseRelatedTicketsWithDrilldown =
    useRelatedTicketsWithDrilldown as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useArticleRelatedTicketsFromContext', () => {
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
            helpCenter: { id: 1 },
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
        mockUseArticleContext.mockReturnValue(defaultContextValue)
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
        it('should return undefined', () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderHook(() =>
                useArticleRelatedTicketsFromContext(),
            )

            expect(result.current).toBeUndefined()
        })

        it('should still call useResourceMetrics but with enabled=false', () => {
            mockUseFlag.mockReturnValue(false)

            renderHook(() => useArticleRelatedTicketsFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: false,
                dateRange: mockDateRange,
            })
        })

        it('should still call useRelatedTicketsWithDrilldown but with enabled=false', () => {
            mockUseFlag.mockReturnValue(false)

            renderHook(() => useArticleRelatedTicketsFromContext())

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: false,
                ticketCount: 42,
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
                useArticleRelatedTicketsFromContext(),
            )

            expect(result.current).toEqual(mockRelatedTicketsData)
        })

        it('should call useFlag with correct feature flag key', () => {
            renderHook(() => useArticleRelatedTicketsFromContext())

            expect(mockUseFlag).toHaveBeenCalledWith(
                FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
            )
        })

        it('should call getLast28DaysDateRange to calculate date range', () => {
            renderHook(() => useArticleRelatedTicketsFromContext())

            expect(mockGetLast28DaysDateRange).toHaveBeenCalled()
        })

        it('should call useResourceMetrics with enabled=true when article exists', () => {
            renderHook(() => useArticleRelatedTicketsFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: true,
                dateRange: mockDateRange,
            })
        })

        it('should call useRelatedTicketsWithDrilldown with enabled=true when article exists', () => {
            renderHook(() => useArticleRelatedTicketsFromContext())

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

            renderHook(() => useArticleRelatedTicketsFromContext())

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

            renderHook(() => useArticleRelatedTicketsFromContext())

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

            renderHook(() => useArticleRelatedTicketsFromContext())

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith(
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

            renderHook(() => useArticleRelatedTicketsFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 0,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: false,
                dateRange: mockDateRange,
            })

            expect(mockUseRelatedTicketsWithDrilldown).toHaveBeenCalledWith({
                resourceSourceId: 0,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: false,
                ticketCount: 42,
                dateRange: mockDateRange,
            })
        })

        it('should use UTC as default timezone when selector returns undefined', () => {
            mockUseAppSelector.mockReturnValue(undefined)

            renderHook(() => useArticleRelatedTicketsFromContext())

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
            renderHook(() => useArticleRelatedTicketsFromContext())

            const resourceMetricsCall = mockUseResourceMetrics.mock.calls[0][0]
            const relatedTicketsCall =
                mockUseRelatedTicketsWithDrilldown.mock.calls[0][0]

            expect(resourceMetricsCall.dateRange).toBe(mockDateRange)
            expect(relatedTicketsCall.dateRange).toBe(mockDateRange)
            expect(resourceMetricsCall.dateRange).toBe(
                relatedTicketsCall.dateRange,
            )
        })
    })

    describe('memoization', () => {
        it('should memoize dateRange across renders', () => {
            mockUseFlag.mockReturnValue(true)

            const { rerender } = renderHook(() =>
                useArticleRelatedTicketsFromContext(),
            )

            const firstCall = mockGetLast28DaysDateRange.mock.calls.length

            rerender()

            const secondCall = mockGetLast28DaysDateRange.mock.calls.length

            // getLast28DaysDateRange should only be called once due to useMemo
            expect(secondCall).toBe(firstCall)
        })
    })
})
