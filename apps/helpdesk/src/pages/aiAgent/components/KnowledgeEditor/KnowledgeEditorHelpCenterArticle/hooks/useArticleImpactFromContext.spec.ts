import { FeatureFlagKey } from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { useResourceMetrics } from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'

import type { MetricProps } from '../../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { useArticleContext } from '../context/ArticleContext'
import type { ArticleContextValue } from '../context/types'
import { useArticleImpactFromContext } from './useArticleImpactFromContext'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/resourceMetrics',
    () => ({
        useResourceMetrics: jest.fn(),
    }),
)

jest.mock('hooks/useAppSelector', () => jest.fn())

jest.mock('../context/ArticleContext', () => ({
    useArticleContext: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock
const mockUseResourceMetrics = useResourceMetrics as jest.Mock
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
        intents: ['Intent 1', 'Intent 2'],
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue('America/New_York')
        mockUseArticleContext.mockReturnValue(defaultContextValue)
        mockUseResourceMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
        })
    })

    describe('when feature flag is disabled', () => {
        it('should return undefined', () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderHook(() => useArticleImpactFromContext())

            expect(result.current).toBeUndefined()
        })

        it('should still call useResourceMetrics but with enabled=false', () => {
            mockUseFlag.mockReturnValue(false)

            renderHook(() => useArticleImpactFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: false,
            })
        })
    })

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should return article impact data', () => {
            const { result } = renderHook(() => useArticleImpactFromContext())

            expect(result.current).toEqual({
                tickets: mockMetricsData.tickets,
                handoverTickets: mockMetricsData.handoverTickets,
                csat: mockMetricsData.csat,
                intents: mockMetricsData.intents,
                isLoading: false,
            })
        })

        it('should call useFlag with correct feature flag key', () => {
            renderHook(() => useArticleImpactFromContext())

            expect(mockUseFlag).toHaveBeenCalledWith(
                FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
            )
        })

        it('should call useResourceMetrics with enabled=true when article exists', () => {
            renderHook(() => useArticleImpactFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith({
                resourceSourceId: 123,
                resourceSourceSetId: 1,
                timezone: 'America/New_York',
                enabled: true,
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
                timezone: 'America/New_York',
                enabled: false,
            })
        })

        it('should use UTC as default timezone when selector returns undefined', () => {
            mockUseAppSelector.mockReturnValue(undefined)

            renderHook(() => useArticleImpactFromContext())

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    timezone: 'UTC',
                }),
            )
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
            })
        })
    })

    describe('memoization', () => {
        it('should return same reference when dependencies do not change', () => {
            mockUseFlag.mockReturnValue(true)

            const { result, rerender } = renderHook(() =>
                useArticleImpactFromContext(),
            )

            const firstResult = result.current
            rerender()
            const secondResult = result.current

            expect(firstResult).toBe(secondResult)
        })

        it('should return new reference when resourceImpact changes', () => {
            mockUseFlag.mockReturnValue(true)

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
