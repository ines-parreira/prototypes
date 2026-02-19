import { renderHook } from '@testing-library/react'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventSegment,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { performanceByArticleQueryFactory } from 'domains/reporting/models/queryFactories/help-center/performanceByArticle'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { useGetHelpCenterStatistics } from 'models/helpCenter/queries'
import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import type { ArticleContextValue } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context/types'

import { useArticleEngagementFromContext } from './useArticleEngagementFromContext'

jest.mock('domains/reporting/hooks/useMetricPerDimension', () => ({
    useMetricPerDimensionV2: jest.fn(),
}))

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterStatistics: jest.fn(),
}))

jest.mock(
    'domains/reporting/models/queryFactories/help-center/performanceByArticle',
    () => ({
        performanceByArticleQueryFactory: jest.fn(),
    }),
)

jest.mock('hooks/useAppSelector', () => jest.fn())

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context',
    () => ({
        useArticleContext: jest.fn(),
    }),
)

const mockUseMetricPerDimension = useMetricPerDimensionV2 as jest.Mock
const mockUseGetHelpCenterStatistics = useGetHelpCenterStatistics as jest.Mock
const mockPerformanceByArticleQueryFactory =
    performanceByArticleQueryFactory as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('useArticleEngagementFromContext', () => {
    const mockArticle = {
        id: 456,
        translation: {
            title: 'Test Engagement Article',
            content: '<p>Test engagement content</p>',
        },
    }

    const defaultContextValue: Partial<ArticleContextValue> = {
        state: {
            article: mockArticle,
            articleMode: 'edit',
            isFullscreen: false,
            isDetailsView: true,
            title: 'Test Engagement Article',
            content: '<p>Test engagement content</p>',
            savedSnapshot: {
                title: 'Test Engagement Article',
                content: '<p>Test engagement content</p>',
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
            helpCenter: { id: 2 },
        } as ArticleContextValue['config'],
    }

    const mockStatisticsData = [
        {
            articleId: 456,
            rating: {
                up: 80,
                down: 20,
            },
        },
    ]

    const mockArticleViewData = {
        data: {
            allData: [
                {
                    [HelpCenterTrackingEventDimensions.ArticleId]: '456',
                    [HelpCenterTrackingEventMeasures.ArticleView]: '1234',
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    const mockQuery = {
        measures: [HelpCenterTrackingEventMeasures.ArticleView],
        dimensions: [
            HelpCenterTrackingEventDimensions.ArticleId,
            HelpCenterTrackingEventDimensions.ArticleTitle,
            HelpCenterTrackingEventDimensions.ArticleSlug,
            HelpCenterTrackingEventDimensions.LocaleCode,
        ],
        timezone: 'America/New_York',
        segments: [HelpCenterTrackingEventSegment.ArticleViewOnly],
        filters: [],
        order: [
            [HelpCenterTrackingEventMeasures.ArticleView, OrderDirection.Desc],
        ],
        metricName: METRIC_NAMES.HELP_CENTER_PERFORMANCE_BY_ARTICLE,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockReturnValue('America/New_York')
        mockUseArticleContext.mockReturnValue(defaultContextValue)
        mockPerformanceByArticleQueryFactory.mockReturnValue(mockQuery)
        mockUseGetHelpCenterStatistics.mockReturnValue({
            data: mockStatisticsData,
            isFetching: false,
        })
        mockUseMetricPerDimension.mockReturnValue(mockArticleViewData)
    })

    describe('when article is not available', () => {
        it('should return engagement data with undefined metrics when article is not available', () => {
            mockUseArticleContext.mockReturnValue({
                ...defaultContextValue,
                state: {
                    ...defaultContextValue.state,
                    article: undefined,
                },
            })
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: [],
                isFetching: false,
            })
            mockUseMetricPerDimension.mockReturnValue({
                data: null,
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current).toEqual({
                views: undefined,
                rating: undefined,
                reactions: undefined,
                isLoading: false,
                subtitle: 'Last 28 days',
            })
        })

        it('should return engagement data with undefined metrics when article id is missing', () => {
            mockUseArticleContext.mockReturnValue({
                ...defaultContextValue,
                state: {
                    ...defaultContextValue.state,
                    article: {
                        translation: {
                            title: 'Test',
                            content: '<p>Test</p>',
                        },
                    },
                },
            })
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: [],
                isFetching: false,
            })
            mockUseMetricPerDimension.mockReturnValue({
                data: null,
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current).toEqual({
                views: undefined,
                rating: undefined,
                reactions: undefined,
                isLoading: false,
                subtitle: 'Last 28 days',
            })
        })
    })

    describe('basic functionality', () => {
        it('should return engagement data when article exists', () => {
            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current).toEqual({
                views: 1234,
                rating: 0.8,
                reactions: {
                    up: 80,
                    down: 20,
                },
                isLoading: false,
                subtitle: 'Last 28 days',
            })
        })
    })

    describe('loading states', () => {
        it('should set isLoading to true when statistics are fetching', () => {
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: mockStatisticsData,
                isFetching: true,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.isLoading).toBe(true)
        })

        it('should set isLoading to true when view data is fetching', () => {
            mockUseMetricPerDimension.mockReturnValue({
                ...mockArticleViewData,
                isFetching: true,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.isLoading).toBe(true)
        })

        it('should set isLoading to true when both are fetching', () => {
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: mockStatisticsData,
                isFetching: true,
            })
            mockUseMetricPerDimension.mockReturnValue({
                ...mockArticleViewData,
                isFetching: true,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.isLoading).toBe(true)
        })

        it('should set isLoading to false when neither are fetching', () => {
            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.isLoading).toBe(false)
        })
    })

    describe('rating calculations', () => {
        it('should calculate rating correctly with mixed reactions', () => {
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: [
                    {
                        articleId: 456,
                        rating: {
                            up: 75,
                            down: 25,
                        },
                    },
                ],
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.rating).toBe(0.75)
            expect(result.current?.reactions).toEqual({
                up: 75,
                down: 25,
            })
        })

        it('should return undefined rating when total reactions is 0', () => {
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: [
                    {
                        articleId: 456,
                        rating: {
                            up: 0,
                            down: 0,
                        },
                    },
                ],
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.rating).toBeUndefined()
            expect(result.current?.reactions).toEqual({
                up: 0,
                down: 0,
            })
        })

        it('should handle rating with only positive reactions', () => {
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: [
                    {
                        articleId: 456,
                        rating: {
                            up: 100,
                            down: 0,
                        },
                    },
                ],
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.rating).toBe(1)
            expect(result.current?.reactions).toEqual({
                up: 100,
                down: 0,
            })
        })

        it('should handle rating with only negative reactions', () => {
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: [
                    {
                        articleId: 456,
                        rating: {
                            up: 0,
                            down: 50,
                        },
                    },
                ],
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.rating).toBe(0)
            expect(result.current?.reactions).toEqual({
                up: 0,
                down: 50,
            })
        })

        it('should return undefined rating when statistics data is empty', () => {
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: [],
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.rating).toBeUndefined()
            expect(result.current?.reactions).toBeUndefined()
        })

        it('should return undefined rating when statistics has no rating property', () => {
            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: [
                    {
                        articleId: 456,
                    },
                ],
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.rating).toBeUndefined()
            expect(result.current?.reactions).toBeUndefined()
        })
    })

    describe('views calculations', () => {
        it('should extract views from article view data', () => {
            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.views).toBe(1234)
        })

        it('should return undefined views when article not found in data', () => {
            mockUseMetricPerDimension.mockReturnValue({
                data: {
                    allData: [],
                },
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.views).toBeUndefined()
        })

        it('should return undefined views when allData is missing', () => {
            mockUseMetricPerDimension.mockReturnValue({
                data: null,
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.views).toBeUndefined()
        })

        it('should return undefined views when ArticleView measure is missing', () => {
            mockUseMetricPerDimension.mockReturnValue({
                data: {
                    allData: [
                        {
                            [HelpCenterTrackingEventDimensions.ArticleId]:
                                '456',
                        },
                    ],
                },
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.views).toBeUndefined()
        })

        it('should convert string view count to number', () => {
            mockUseMetricPerDimension.mockReturnValue({
                data: {
                    allData: [
                        {
                            [HelpCenterTrackingEventDimensions.ArticleId]:
                                '456',
                            [HelpCenterTrackingEventMeasures.ArticleView]:
                                '5678',
                        },
                    ],
                },
                isFetching: false,
            })

            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.views).toBe(5678)
            expect(typeof result.current?.views).toBe('number')
        })
    })

    describe('hook call verification', () => {
        it('should call useGetHelpCenterStatistics with correct parameters', () => {
            renderHook(() => useArticleEngagementFromContext())

            expect(mockUseGetHelpCenterStatistics).toHaveBeenCalledWith(
                2,
                expect.objectContaining({
                    start_date: expect.any(String),
                    end_date: expect.any(String),
                    ids: [456],
                }),
                {
                    enabled: true,
                },
            )
        })

        it('should call performanceByArticleQueryFactory with correct filters', () => {
            renderHook(() => useArticleEngagementFromContext())

            expect(mockPerformanceByArticleQueryFactory).toHaveBeenCalledWith(
                expect.objectContaining({
                    helpCenters: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [2],
                    },
                    period: expect.objectContaining({
                        start_datetime: expect.any(String),
                        end_datetime: expect.any(String),
                    }),
                }),
                'America/New_York',
            )
        })

        it('should call useMetricPerDimension with article filter added to query', () => {
            renderHook(() => useArticleEngagementFromContext())

            expect(mockUseMetricPerDimension).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...mockQuery,
                    filters: [
                        {
                            member: HelpCenterTrackingEventDimensions.ArticleId,
                            operator: ReportingFilterOperator.Equals,
                            values: ['456'],
                        },
                    ],
                }),
                expect.objectContaining({
                    filters: expect.arrayContaining([
                        {
                            member: 'articleId',
                            operator: 'one-of',
                            values: ['456'],
                        },
                    ]),
                }),
                undefined,
                true,
            )
        })

        it('should use UTC timezone when selector returns undefined', () => {
            mockUseAppSelector.mockReturnValue(undefined)

            renderHook(() => useArticleEngagementFromContext())

            expect(mockPerformanceByArticleQueryFactory).toHaveBeenCalledWith(
                expect.any(Object),
                'UTC',
            )
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

        it('should return the formatted date range subtitle instead of "Last 28 days"', () => {
            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current?.subtitle).not.toBe('Last 28 days')
            expect(result.current?.subtitle).toContain('Mar')
        })

        it('should call useGetHelpCenterStatistics with the impact date range', () => {
            renderHook(() => useArticleEngagementFromContext())

            expect(mockUseGetHelpCenterStatistics).toHaveBeenCalledWith(
                2,
                {
                    start_date: impactDateRange.start_datetime,
                    end_date: impactDateRange.end_datetime,
                    ids: [456],
                },
                { enabled: true },
            )
        })

        it('should call performanceByArticleQueryFactory with the impact period', () => {
            renderHook(() => useArticleEngagementFromContext())

            expect(mockPerformanceByArticleQueryFactory).toHaveBeenCalledWith(
                {
                    helpCenters: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [2],
                    },
                    period: {
                        start_datetime: impactDateRange.start_datetime,
                        end_datetime: impactDateRange.end_datetime,
                    },
                },
                'America/New_York',
            )
        })

        it('should still return full engagement data', () => {
            const { result } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            expect(result.current).toEqual(
                expect.objectContaining({
                    views: 1234,
                    rating: 0.8,
                    reactions: { up: 80, down: 20 },
                    isLoading: false,
                }),
            )
        })

        it('should call useMetricPerDimension with article filter from impact-based query', () => {
            renderHook(() => useArticleEngagementFromContext())

            expect(mockUseMetricPerDimension).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: expect.arrayContaining([
                        {
                            member: HelpCenterTrackingEventDimensions.ArticleId,
                            operator: ReportingFilterOperator.Equals,
                            values: ['456'],
                        },
                    ]),
                }),
                expect.objectContaining({
                    filters: expect.arrayContaining([
                        {
                            member: 'articleId',
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: ['456'],
                        },
                    ]),
                }),
                undefined,
                true,
            )
        })
    })

    describe('memoization', () => {
        it('should return new reference when view data changes', () => {
            const { result, rerender } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            const firstResult = result.current

            mockUseMetricPerDimension.mockReturnValue({
                data: {
                    allData: [
                        {
                            [HelpCenterTrackingEventDimensions.ArticleId]:
                                '456',
                            [HelpCenterTrackingEventMeasures.ArticleView]:
                                '9999',
                        },
                    ],
                },
                isFetching: false,
            })

            rerender()
            const secondResult = result.current

            expect(firstResult).not.toBe(secondResult)
            expect(secondResult?.views).toBe(9999)
        })

        it('should return new reference when statistics data changes', () => {
            const { result, rerender } = renderHook(() =>
                useArticleEngagementFromContext(),
            )

            const firstResult = result.current

            mockUseGetHelpCenterStatistics.mockReturnValue({
                data: [
                    {
                        articleId: 456,
                        rating: {
                            up: 90,
                            down: 10,
                        },
                    },
                ],
                isFetching: false,
            })

            rerender()
            const secondResult = result.current

            expect(firstResult).not.toBe(secondResult)
            expect(secondResult?.rating).toBe(0.9)
        })
    })
})
