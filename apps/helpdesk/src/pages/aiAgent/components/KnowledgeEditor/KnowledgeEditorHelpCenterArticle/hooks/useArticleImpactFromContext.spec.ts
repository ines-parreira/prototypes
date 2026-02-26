import { renderHook } from '@testing-library/react'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context/ArticleContext'
import type { ArticleContextValue } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context/types'
import type { MetricProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'

import { useArticleImpactFromContext } from './useArticleImpactFromContext'

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
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

const mockUseResourceMetrics = useResourceMetrics as jest.Mock
const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useArticleImpactFromContext', () => {
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

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue('America/New_York')
        mockUseArticleContext.mockReturnValue(defaultContextValue)
        mockGetLast28DaysDateRange.mockReturnValue(mockDateRange)
        mockUseResourceMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
        })
    })

    it('should return article impact data', () => {
        const { result } = renderHook(() => useArticleImpactFromContext())

        expect(result.current).toEqual({
            tickets: mockMetricsData.tickets,
            handoverTickets: mockMetricsData.handoverTickets,
            csat: mockMetricsData.csat,
            intents: ['Intent 1', 'Intent 2'],
            isLoading: false,
            subtitle: 'Last 28 days',
        })
    })

    it('should call useResourceMetrics with enabled=true when article exists', () => {
        renderHook(() => useArticleImpactFromContext())

        expect(mockUseResourceMetrics).toHaveBeenCalledWith({
            resourceSourceId: 123,
            resourceSourceSetId: 1,
            shopIntegrationId: 0,
            timezone: 'America/New_York',
            enabled: true,
            dateRange: mockDateRange,
        })
    })

    it('should call useResourceMetrics with enabled=false when article is undefined', () => {
        mockUseArticleContext.mockReturnValue({
            ...defaultContextValue,
            state: {
                ...defaultContextValue.state,
                article: undefined,
            },
        })

        renderHook(() => useArticleImpactFromContext())

        expect(mockUseResourceMetrics).toHaveBeenCalledWith({
            resourceSourceId: 0,
            resourceSourceSetId: 1,
            shopIntegrationId: 0,
            timezone: 'America/New_York',
            enabled: false,
            dateRange: mockDateRange,
        })
    })

    it('should use UTC as default timezone when selector returns undefined', () => {
        mockUseAppSelector.mockReturnValue(undefined)

        renderHook(() => useArticleImpactFromContext())

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
    })

    it('should use shop_integration_id when available', () => {
        mockUseArticleContext.mockReturnValue({
            ...defaultContextValue,
            config: {
                helpCenter: {
                    id: 1,
                    shop_integration_id: 456,
                },
            } as ArticleContextValue['config'],
        })

        renderHook(() => useArticleImpactFromContext())

        expect(mockUseResourceMetrics).toHaveBeenCalledWith({
            resourceSourceId: 123,
            resourceSourceSetId: 1,
            shopIntegrationId: 456,
            timezone: 'America/New_York',
            enabled: true,
            dateRange: mockDateRange,
        })
    })

    it('should return isLoading=true when metrics are loading', () => {
        mockUseResourceMetrics.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() => useArticleImpactFromContext())

        expect(result.current?.isLoading).toBe(true)
    })

    it('should return undefined for metrics when data is not available', () => {
        mockUseResourceMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(() => useArticleImpactFromContext())

        expect(result.current).toEqual({
            tickets: undefined,
            handoverTickets: undefined,
            csat: undefined,
            intents: undefined,
            isLoading: false,
            subtitle: 'Last 28 days',
        })
    })

    describe('when impactDateRange is provided', () => {
        const impactDateRange = {
            start_datetime: '2025-03-01T00:00:00.000Z',
            end_datetime: '2025-03-15T00:00:00.000Z',
        }

        const contextWithImpactDateRange = {
            ...defaultContextValue,
            state: {
                ...defaultContextValue.state,
                historicalVersion: {
                    versionId: 42,
                    impactDateRange,
                },
            },
        }

        beforeEach(() => {
            mockUseArticleContext.mockReturnValue(contextWithImpactDateRange)
        })

        it('should not call getLast28DaysDateRange', () => {
            renderHook(() => useArticleImpactFromContext())

            expect(mockGetLast28DaysDateRange).not.toHaveBeenCalled()
        })

        it('should pass the impact date range to useResourceMetrics', () => {
            renderHook(() => useArticleImpactFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateRange: impactDateRange,
                }),
            )
        })

        it('should return the formatted date range subtitle instead of "Last 28 days"', () => {
            const { result } = renderHook(() => useArticleImpactFromContext())

            expect(result.current?.subtitle).not.toBe('Last 28 days')
            expect(result.current?.subtitle).toContain('Mar')
        })

        it('should still return impact data', () => {
            const { result } = renderHook(() => useArticleImpactFromContext())

            expect(result.current).toEqual(
                expect.objectContaining({
                    tickets: mockMetricsData.tickets,
                    handoverTickets: mockMetricsData.handoverTickets,
                    csat: mockMetricsData.csat,
                    intents: ['Intent 1', 'Intent 2'],
                    isLoading: false,
                }),
            )
        })
    })

    describe('memoization', () => {
        it('should return same reference when dependencies do not change', () => {
            const { result, rerender } = renderHook(() =>
                useArticleImpactFromContext(),
            )

            const firstResult = result.current
            rerender()
            const secondResult = result.current

            expect(firstResult).toBe(secondResult)
        })

        it('should return new reference when resourceImpact changes', () => {
            const { result, rerender } = renderHook(() =>
                useArticleImpactFromContext(),
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
