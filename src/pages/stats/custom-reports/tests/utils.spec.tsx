import React from 'react'

import { AxiosError } from 'axios'

import {
    AnalyticsCustomReport,
    AnalyticsCustomReportChartSchema,
    AnalyticsCustomReportRowSchema,
    AnalyticsCustomReportRowSchemaChildrenItemType,
    AnalyticsCustomReportRowSchemaType,
    AnalyticsCustomReportSectionSchema,
    AnalyticsCustomReportSectionSchemaChildrenItem,
    AnalyticsCustomReportSectionSchemaType,
    AnalyticsCustomReportType,
} from '@gorgias/api-types'

import { REPORTS_CONFIG } from 'pages/stats/custom-reports/config'
import { ReportsIDs } from 'pages/stats/custom-reports/constants'
import {
    ChartConfig,
    ChartType,
    CustomReportChartSchema,
    CustomReportChild,
    CustomReportChildType,
    CustomReportSchema,
    DashboardInput,
} from 'pages/stats/custom-reports/types'
import {
    createDashboardPayload,
    customReportFromApi,
    getChildrenIds,
    getChildrenOfTypeChart,
    getErrorMessage,
    getGroupChartsIntoRows,
    getNumberOfSelections,
    getReportsConfigSearchResult,
    updateChartPosition,
} from 'pages/stats/custom-reports/utils'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'
import { AGENT_PERFORMANCE_SECTION_TITLE } from 'pages/stats/support-performance/agents/AgentsTableChart'
import {
    AGENT_PERSISTENT_FILTERS,
    AGENTS_OPTIONAL_FILTERS,
    AgentsChart,
} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import { TopCsatPerformers } from 'pages/stats/support-performance/agents/TopCsatPerformers'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { STATS_ROUTES } from 'routes/constants'

describe('customReportFromApi', () => {
    const apiReportWithoutChildren: AnalyticsCustomReport = {
        account_id: 0,
        analytics_filter_id: 0,
        children: [],
        created_by: 0,
        created_datetime: 'asd',
        id: 0,
        name: 'some name',
        type: AnalyticsCustomReportType.Custom,
        updated_by: 0,
        updated_datetime: '123',
    }
    const apiSection: AnalyticsCustomReportSectionSchema = {
        metadata: {},
        children: [],
        type: AnalyticsCustomReportSectionSchemaType.Section,
    }
    const apiRow: AnalyticsCustomReportRowSchema = {
        children: [],
        metadata: {},
        type: AnalyticsCustomReportRowSchemaType.Row,
    }
    const apiChart: AnalyticsCustomReportChartSchema = {
        config_id: 'someId',
        metadata: {},
        type: AnalyticsCustomReportRowSchemaChildrenItemType.Chart,
    }

    it('should create a CustomReport with subset of props', () => {
        const expectedReport: CustomReportSchema = {
            analytics_filter_id: apiReportWithoutChildren.analytics_filter_id,
            children: [],
            id: apiReportWithoutChildren.id,
            name: apiReportWithoutChildren.name,
            emoji: apiReportWithoutChildren.emoji,
        }
        const report = customReportFromApi(apiReportWithoutChildren)

        expect(report).toEqual(expectedReport)
    })

    it('should create a CustomReport with children', () => {
        const apiReportWithChildren = {
            ...apiReportWithoutChildren,
            children: [
                {
                    ...apiSection,
                    children: [
                        { ...apiRow, children: [{ ...apiChart }] },
                        apiChart,
                    ],
                },
                apiRow,
                apiChart,
            ],
        }
        const expectedReport: CustomReportSchema = {
            id: apiReportWithoutChildren.id,
            name: apiReportWithoutChildren.name,
            emoji: undefined,
            analytics_filter_id: apiReportWithoutChildren.analytics_filter_id,
            children: [
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Row,
                            children: [
                                {
                                    config_id: apiChart.config_id,
                                    type: CustomReportChildType.Chart,
                                },
                            ],
                        },
                        {
                            config_id: apiChart.config_id,
                            type: CustomReportChildType.Chart,
                        },
                    ],
                },
                {
                    type: CustomReportChildType.Row,
                    children: [],
                },
                {
                    config_id: apiChart.config_id,
                    type: CustomReportChildType.Chart,
                },
            ],
        }
        const report = customReportFromApi(apiReportWithChildren)

        expect(report).toEqual(expectedReport)
    })

    it('should ignore unknown types', () => {
        const unknownElement = {
            type: 'unknown',
        } as unknown as AnalyticsCustomReportSectionSchemaChildrenItem
        const apiReportWithChildren = {
            ...apiReportWithoutChildren,
            children: [
                {
                    ...apiSection,
                    children: [
                        {
                            ...apiRow,
                            children: [
                                unknownElement as AnalyticsCustomReportChartSchema,
                            ],
                        },
                        unknownElement,
                    ],
                },
                unknownElement,
            ],
        }
        const expectedReport: CustomReportSchema = {
            id: apiReportWithoutChildren.id,
            name: apiReportWithoutChildren.name,
            emoji: apiReportWithoutChildren.emoji,
            analytics_filter_id: apiReportWithoutChildren.analytics_filter_id,
            children: [
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Row,
                            children: [],
                        },
                    ],
                },
            ],
        }

        const report = customReportFromApi(apiReportWithChildren)

        expect(report).toEqual(expectedReport)
    })

    it('should return undefined if it receives undefined', () => {
        expect(customReportFromApi(undefined)).toEqual(undefined)
    })
})

describe('getGroupChartsIntoRows', () => {
    it('should return an empty array if no charts are provided', () => {
        const result = getGroupChartsIntoRows([])

        expect(result).toEqual([])
    })

    it('should wrap charts into a row', () => {
        const charts = ['chart1', 'chart2', 'chart3']

        const result = getGroupChartsIntoRows(charts)
        expect(result.length).toBe(1)
        expect(result[0]).toEqual({
            children: [
                { config_id: 'chart1', type: 'chart' },
                { config_id: 'chart2', type: 'chart' },
                { config_id: 'chart3', type: 'chart' },
            ],
            type: 'row',
        })
    })
})

describe('getNumberOfSelections', () => {
    const mockCharts: Record<string, ChartConfig> = {
        chart1: {
            chartComponent: () => <div>Chart 1</div>,
            label: 'Chart 1 Label',
            csvProducer: null,
            description: 'Description for chart 1',
            chartType: ChartType.Graph,
        },
        chart2: {
            chartComponent: () => <div>Chart 2</div>,
            label: 'Chart 2 Label',
            csvProducer: null,
            description: 'Description for chart 2',
            chartType: ChartType.Graph,
        },
        chart3: {
            chartComponent: () => <div>Chart 3</div>,
            label: 'Chart 3 Label',
            csvProducer: null,
            description: 'Description for chart 3',
            chartType: ChartType.Graph,
        },
    }

    it('should return 0 when no charts are selected', () => {
        const checkedCharts: string[] = []
        const result = getNumberOfSelections(mockCharts, checkedCharts)
        expect(result).toBe(0)
    })

    it('should return correct number of selections when some charts are selected', () => {
        const checkedCharts: string[] = ['chart1', 'chart2']
        const result = getNumberOfSelections(mockCharts, checkedCharts)
        expect(result).toBe(2)
    })

    it('should return 0 if checkedCharts is empty', () => {
        const checkedCharts: string[] = []
        const result = getNumberOfSelections(mockCharts, checkedCharts)
        expect(result).toBe(0)
    })

    it('should return correct count if the same chart is selected multiple times', () => {
        const checkedCharts: string[] = ['chart1', 'chart1', 'chart2']
        const result = getNumberOfSelections(mockCharts, checkedCharts)
        expect(result).toBe(3)
    })

    it('should return correct count when all charts are selected', () => {
        const checkedCharts: string[] = ['chart1', 'chart2', 'chart3']
        const result = getNumberOfSelections(mockCharts, checkedCharts)
        expect(result).toBe(3)
    })

    it('should return 0 when no matching chart ids in checkedCharts', () => {
        const checkedCharts: string[] = ['chart4', 'chart5']
        const result = getNumberOfSelections(mockCharts, checkedCharts)
        expect(result).toBe(0)
    })
})

describe('getSearchConfig', () => {
    it('should return matching charts based on case-insensitive search query', () => {
        const searchValue =
            OverviewMetricConfig[OverviewMetric.CustomerSatisfaction].title
        const result = getReportsConfigSearchResult(REPORTS_CONFIG, searchValue)

        expect(result).toEqual([
            {
                category: 'Support Performance',
                children: [
                    {
                        type: OverviewChart,
                        config: {
                            ...SupportPerformanceOverviewReportConfig,
                            charts: {
                                [OverviewChart.CustomerSatisfactionTrendCard]:
                                    SupportPerformanceOverviewReportConfig
                                        .charts[
                                        OverviewChart
                                            .CustomerSatisfactionTrendCard
                                    ],
                            },
                        },
                    },
                    {
                        config: {
                            charts: {
                                [AgentsChart.TopCSATPerformers]: {
                                    chartComponent: TopCsatPerformers,
                                    label: AgentsShoutOutsConfig[
                                        TopPerformersChart.TopCSATPerformers
                                    ].title,
                                    description:
                                        AgentsShoutOutsConfig[
                                            TopPerformersChart.TopCSATPerformers
                                        ].hint.title,
                                    csvProducer: null,
                                    chartType: ChartType.Card,
                                },
                            },
                            id: ReportsIDs.SupportPerformanceAgentsReportConfig,
                            reportFilters: {
                                persistent: AGENT_PERSISTENT_FILTERS,
                                optional: AGENTS_OPTIONAL_FILTERS,
                            },
                            reportName: AGENT_PERFORMANCE_SECTION_TITLE,
                            reportPath: STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS,
                        },
                        type: AgentsChart,
                    },
                ],
            },
            {
                category: 'Quality management',
                children: [
                    {
                        type: SatisfactionChart,
                        config: {
                            ...SatisfactionReportConfig,
                            charts: {
                                [SatisfactionChart.AverageSurveyScoreDonutChart]:
                                    SatisfactionReportConfig.charts[
                                        SatisfactionChart
                                            .AverageSurveyScoreDonutChart
                                    ],
                                [SatisfactionChart.AverageCSATPerDimensionTrendChart]:
                                    SatisfactionReportConfig.charts[
                                        SatisfactionChart
                                            .AverageCSATPerDimensionTrendChart
                                    ],
                            },
                        },
                    },
                ],
            },
        ])
    })

    it('should return null if no charts match the search query', () => {
        const searchValue = 'Nonexistent'
        const result = getReportsConfigSearchResult(REPORTS_CONFIG, searchValue)

        expect(result).toEqual(null)
    })

    it('should correctly match partial chart labels', () => {
        const searchValue = 'Messages'
        const result = getReportsConfigSearchResult(REPORTS_CONFIG, searchValue)

        expect(result).toEqual([
            {
                category: 'Support Performance',
                children: [
                    {
                        type: OverviewChart,
                        config: {
                            ...SupportPerformanceOverviewReportConfig,
                            charts: {
                                [OverviewChart.MessagesPerTicketTrendCard]:
                                    SupportPerformanceOverviewReportConfig
                                        .charts[
                                        OverviewChart.MessagesPerTicketTrendCard
                                    ],
                                [OverviewChart.MessagesSentGraph]:
                                    SupportPerformanceOverviewReportConfig
                                        .charts[
                                        OverviewChart.MessagesSentGraph
                                    ],
                                [OverviewChart.MessagesSentTrendCard]:
                                    SupportPerformanceOverviewReportConfig
                                        .charts[
                                        OverviewChart.MessagesSentTrendCard
                                    ],
                            },
                        },
                    },
                ],
            },
        ])
    })

    it('should return all charts if the search query is empty', () => {
        const searchValue = ''
        const result = getReportsConfigSearchResult(REPORTS_CONFIG, searchValue)

        expect(result).toEqual(REPORTS_CONFIG)
    })
})

describe('getChildrenOfTypeChart', () => {
    it('should return empty array for empty report', () => {
        const report: CustomReportSchema = {
            id: 1,
            name: 'Empty Report',
            analytics_filter_id: 101,
            emoji: null,
            children: [],
        }
        const result = getChildrenOfTypeChart(report)
        expect(result).toEqual([])
    })

    it('should return direct chart children', () => {
        const report: CustomReportSchema = {
            id: 2,
            name: 'Direct Charts',
            analytics_filter_id: 102,
            emoji: '📊',
            children: [
                {
                    type: CustomReportChildType.Chart,
                    config_id: 'chart-1',
                },
                {
                    type: CustomReportChildType.Chart,
                    config_id: 'chart-2',
                },
            ],
        }
        const result = getChildrenOfTypeChart(report)
        expect(result).toEqual([
            {
                type: CustomReportChildType.Chart,
                config_id: 'chart-1',
            },
            {
                type: CustomReportChildType.Chart,
                config_id: 'chart-2',
            },
        ])
    })

    it('should return nested chart children', () => {
        const report: CustomReportSchema = {
            id: 3,
            name: 'Nested Charts',
            analytics_filter_id: 103,
            emoji: '🌐',
            children: [
                {
                    type: CustomReportChildType.Row,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'chart-1',
                        },
                    ],
                },
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Row,
                            children: [
                                {
                                    type: CustomReportChildType.Chart,
                                    config_id: 'chart-2',
                                },
                            ],
                        },
                    ],
                },
            ],
        }
        const result = getChildrenOfTypeChart(report)
        expect(result).toEqual([
            {
                type: CustomReportChildType.Chart,
                config_id: 'chart-1',
            },
            {
                type: CustomReportChildType.Chart,
                config_id: 'chart-2',
            },
        ])
    })

    it('should handle mixed chart and non-chart children', () => {
        const report: CustomReportSchema = {
            id: 4,
            name: 'Mixed Children',
            analytics_filter_id: 104,
            emoji: '🔥',
            children: [
                {
                    type: CustomReportChildType.Row,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'chart-1',
                        },
                    ],
                },
                {
                    type: CustomReportChildType.Chart,
                    config_id: 'chart-2',
                },
            ],
        }
        const result = getChildrenOfTypeChart(report)
        expect(result).toEqual([
            {
                type: CustomReportChildType.Chart,
                config_id: 'chart-1',
            },
            {
                type: CustomReportChildType.Chart,
                config_id: 'chart-2',
            },
        ])
    })

    it('should handle null/undefined children', () => {
        const report: CustomReportSchema = {
            id: 5,
            name: 'Null Children',
            analytics_filter_id: 105,
            emoji: null,
            children: [
                null,
                undefined,
                {
                    type: CustomReportChildType.Chart,
                    config_id: 'chart-1',
                },
            ] as any,
        }
        const result = getChildrenOfTypeChart(report)
        expect(result).toEqual([
            {
                type: CustomReportChildType.Chart,
                config_id: 'chart-1',
            },
        ])
    })
})

describe('getErrorMessage(error, defaultMessage)', () => {
    it('should return string', () => {
        const actual = getErrorMessage(null)

        expect(typeof actual).toBe('string')
    })

    it('should return `defaultMessage` if given error is not formatted correctly', () => {
        const defaultMessage = 'Oops! Something went wrong.'

        const actual = getErrorMessage(null, defaultMessage)

        expect(actual).toBe(defaultMessage)
    })

    it('should return error message if `error` is an instance of `Error`', () => {
        const error = new Error('Not Found.')

        const actual = getErrorMessage(error)

        expect(actual).toBe(error.message)
    })

    it('should construct simple error message', () => {
        const msg = 'Bad Request.'
        const error = createError({ msg })

        const actual = getErrorMessage(error)

        expect(actual).toBe(msg)
    })

    it('should construct error message from error data', () => {
        const msg = 'Bad Request.'
        const nameError = 'Name is missing.'
        const emojiErrors = ['Inappropriate emoji.']

        const error = createError({
            msg,
            data: { name: nameError, emoji: emojiErrors },
        })

        const actual = getErrorMessage(error)

        expect(actual).toBe(msg + ' ' + nameError + ' ' + emojiErrors.join(' '))
    })
})

describe('createDashboardPayload', () => {
    it('should create a custom report with the correct payload', () => {
        const input: DashboardInput = {
            name: 'Test Dashboard',
            emoji: '🖖',
            analytics_filter_id: 123,
            children: [
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Row,
                            children: [
                                {
                                    type: CustomReportChildType.Chart,
                                    config_id: 'config_id',
                                },
                            ],
                        },
                    ],
                },
            ],
        }
        const expected = {
            name: 'Test Dashboard',
            emoji: '🖖',
            analytics_filter_id: 123,
            type: 'custom',
            children: [
                {
                    type: CustomReportChildType.Section,
                    metadata: {},
                    children: [
                        {
                            type: CustomReportChildType.Row,
                            metadata: {},
                            children: [
                                {
                                    type: CustomReportChildType.Chart,
                                    config_id: 'config_id',
                                    metadata: {},
                                },
                            ],
                        },
                    ],
                },
            ],
        }

        const actual = createDashboardPayload(input)

        expect(actual).toEqual(expected)
    })

    it('should provide defaults if not provided in the Dashboard object', () => {
        const dashboard = { name: 'Test Dashboard' }

        const expected = {
            name: 'Test Dashboard',
            emoji: null,
            analytics_filter_id: null,
            type: 'custom',
            children: [],
        }

        const actual = createDashboardPayload(dashboard)

        expect(actual).toEqual(expected)
    })
})

const createError = (error: any) =>
    new AxiosError(undefined, undefined, undefined, undefined, {
        data: { error },
    } as any)

describe('getErrorMessage(error, defaultMessage)', () => {
    it('should return string', () => {
        const actual = getErrorMessage(null)

        expect(typeof actual).toBe('string')
    })

    it('should return `defaultMessage` if given error is not formatted correctly', () => {
        const defaultMessage = 'Oops! Something went wrong.'

        const actual = getErrorMessage(null, defaultMessage)

        expect(actual).toBe(defaultMessage)
    })

    it('should return error message if `error` is an instance of `Error`', () => {
        const error = new Error('Not Found.')

        const actual = getErrorMessage(error)

        expect(actual).toBe(error.message)
    })

    it('should construct simple error message', () => {
        const msg = 'Bad Request.'
        const error = createError({ msg })

        const actual = getErrorMessage(error)

        expect(actual).toBe(msg)
    })

    it('should construct error message from error data', () => {
        const msg = 'Bad Request.'
        const nameError = 'Name is missing.'
        const emojiErrors = ['Inappropriate emoji.']

        const error = createError({
            msg,
            data: { name: nameError, emoji: emojiErrors },
        })

        const actual = getErrorMessage(error)

        expect(actual).toBe(msg + ' ' + nameError + ' ' + emojiErrors.join(' '))
    })
})

describe('createDashboardPayload', () => {
    it('should create a custom report with the correct payload', () => {
        const dashboard: DashboardInput = {
            name: 'Test Dashboard',
            emoji: '🖖',
            analytics_filter_id: 123,
            children: [
                {
                    type: CustomReportChildType.Row,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'config_id',
                        },
                    ],
                },
            ],
        }

        const expected = {
            name: 'Test Dashboard',
            emoji: '🖖',
            analytics_filter_id: 123,
            type: 'custom',
            children: [
                {
                    type: CustomReportChildType.Row,
                    metadata: {},
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'config_id',
                            metadata: {},
                        },
                    ],
                },
            ],
        }

        const actual = createDashboardPayload(dashboard)

        expect(actual).toEqual(expected)
    })

    it('should create an empty report with the correct payload', () => {
        const dashboard = { name: 'Test Dashboard' }

        const expected = {
            name: 'Test Dashboard',
            emoji: null,
            analytics_filter_id: null,
            type: 'custom',
            children: [],
        }

        const actual = createDashboardPayload(dashboard)

        expect(actual).toEqual(expected)
    })
})

describe('getChildrenIds', () => {
    it('should return an empty array if children is undefined', () => {
        const actual = getChildrenIds(undefined)

        expect(actual).toEqual([])
    })

    it('should return an array of children ids from a row', () => {
        const children: CustomReportChild[] = [
            {
                type: CustomReportChildType.Row,
                children: [
                    {
                        type: CustomReportChildType.Chart,
                        config_id: 'config_id_1',
                    },
                    {
                        type: CustomReportChildType.Chart,
                        config_id: 'config_id_2',
                    },
                ],
            },
        ]

        const actual = getChildrenIds(children)

        expect(actual).toEqual(['config_id_1', 'config_id_2'])
    })

    it('should return an array of children ids from charts', () => {
        const children: CustomReportChild[] = [
            {
                type: CustomReportChildType.Chart,
                config_id: 'config_id_1',
            },
            {
                type: CustomReportChildType.Chart,
                config_id: 'config_id_2',
            },
        ]

        const actual = getChildrenIds(children)

        expect(actual).toEqual(['config_id_1', 'config_id_2'])
    })

    it('should return an array of children ids from different rows', () => {
        const children: CustomReportChild[] = [
            {
                type: CustomReportChildType.Row,
                children: [
                    {
                        type: CustomReportChildType.Chart,
                        config_id: 'config_id_1',
                    },
                ],
            },
            {
                type: CustomReportChildType.Row,
                children: [
                    {
                        type: CustomReportChildType.Chart,
                        config_id: 'config_id_2',
                    },
                ],
            },
        ]

        const actual = getChildrenIds(children)

        expect(actual).toEqual(['config_id_1', 'config_id_2'])
    })

    it('should return an empty array for section', () => {
        const children: CustomReportChild[] = [
            {
                type: CustomReportChildType.Section,
                children: [
                    {
                        type: CustomReportChildType.Row,
                        children: [
                            {
                                type: CustomReportChildType.Chart,
                                config_id: 'config_id_2',
                            },
                        ],
                    },
                ],
            },
        ]

        const actual = getChildrenIds(children)

        expect(actual).toEqual([])
    })
})

describe('updateChartPosition', () => {
    const chartToMove: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: 'chartToMoveId',
    }
    const targetChart: CustomReportChartSchema = {
        type: CustomReportChildType.Chart,
        config_id: 'targetChartId',
    }
    const dashboard: CustomReportSchema = {
        id: 123,
        name: 'someName',
        emoji: null,
        children: [
            {
                type: CustomReportChildType.Row,
                children: [
                    chartToMove,
                    {
                        type: CustomReportChildType.Chart,
                        config_id: 'someOtherChart',
                    },
                ],
            },
            {
                type: CustomReportChildType.Section,
                children: [
                    {
                        type: CustomReportChildType.Chart,
                        config_id: 'someBeforeTargetChart',
                    },
                    targetChart,
                    {
                        type: CustomReportChildType.Chart,
                        config_id: 'someAfterTargetChart',
                    },
                ],
            },
        ],
    }

    it('should move chart in Dashboard structure and place it after target element', () => {
        const updatedDashboard = updateChartPosition(
            dashboard,
            chartToMove.config_id,
            targetChart.config_id,
            'after',
        )

        expect(updatedDashboard).toEqual({
            id: 123,
            name: 'someName',
            emoji: null,
            children: [
                {
                    type: CustomReportChildType.Row,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someOtherChart',
                        },
                    ],
                },
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someBeforeTargetChart',
                        },
                        targetChart,
                        chartToMove,
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someAfterTargetChart',
                        },
                    ],
                },
            ],
        })
    })

    it('should move chart in Dashboard structure and place it before target element', () => {
        const updatedDashboard = updateChartPosition(
            dashboard,
            chartToMove.config_id,
            targetChart.config_id,
            'before',
        )

        expect(updatedDashboard).toEqual({
            id: 123,
            name: 'someName',
            emoji: null,
            children: [
                {
                    type: CustomReportChildType.Row,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someOtherChart',
                        },
                    ],
                },
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someBeforeTargetChart',
                        },
                        chartToMove,
                        targetChart,
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someAfterTargetChart',
                        },
                    ],
                },
            ],
        })
    })

    it('should leave Report unchanged if chart to move does not exist', () => {
        const updatedDashboard = updateChartPosition(
            dashboard,
            'nonExistentChartId',
            targetChart.config_id,
            'before',
        )

        expect(updatedDashboard).toEqual({
            id: 123,
            name: 'someName',
            emoji: null,
            children: [
                {
                    type: CustomReportChildType.Row,
                    children: [
                        chartToMove,
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someOtherChart',
                        },
                    ],
                },
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someBeforeTargetChart',
                        },
                        targetChart,
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someAfterTargetChart',
                        },
                    ],
                },
            ],
        })
    })

    it('should only remove the chart if target chart does not exist', () => {
        const updatedDashboard = updateChartPosition(
            dashboard,
            chartToMove.config_id,
            'nonExistentTargetChart',
            'before',
        )

        expect(updatedDashboard).toEqual({
            id: 123,
            name: 'someName',
            emoji: null,
            children: [
                {
                    type: CustomReportChildType.Row,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someOtherChart',
                        },
                    ],
                },
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someBeforeTargetChart',
                        },
                        targetChart,
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'someAfterTargetChart',
                        },
                    ],
                },
            ],
        })
    })
})
