import { reportError } from '@repo/logging'
import { AxiosError } from 'axios'

import type {
    AnalyticsCustomReport,
    AnalyticsCustomReportChartSchema,
    AnalyticsCustomReportRowSchema,
    AnalyticsCustomReportSectionSchema,
} from '@gorgias/helpdesk-types'
import {
    AnalyticsCustomReportRowSchemaChildrenItemType,
    AnalyticsCustomReportRowSchemaType,
    AnalyticsCustomReportSectionSchemaType,
    AnalyticsCustomReportType,
} from '@gorgias/helpdesk-types'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { REPORTS_CONFIG } from 'domains/reporting/pages/dashboards/config'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type {
    ChartConfig,
    DashboardChartSchema,
    DashboardChild,
    DashboardInput,
    DashboardRowSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'
import {
    createDashboardPayload,
    dashboardChartChildFromApi,
    dashboardFromApi,
    getChildrenIds,
    getChildrenOfTypeChart,
    getErrorMessage,
    getGroupChartsIntoRows,
    getNumberOfSelections,
    getReportsConfigSearchResult,
    updateChartPosition,
} from 'domains/reporting/pages/dashboards/utils'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'domains/reporting/pages/support-performance/agents/AgentsShoutOutsConfig'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import {
    AGENT_PERSISTENT_FILTERS,
    AGENTS_OPTIONAL_FILTERS,
    AgentsChart,
} from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReportConfig'
import { TopCsatPerformers } from 'domains/reporting/pages/support-performance/agents/TopCsatPerformers'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { STATS_ROUTES } from 'routes/constants'

jest.mock('@repo/logging')
const reportErrorMock = reportError

describe('dashboardFromApi', () => {
    const apiReportWithoutChildren: AnalyticsCustomReport = {
        account_id: 0,
        analytics_filter_id: 0,
        children: [],
        created_by: 0,
        created_datetime: '2025-01-01T00:00:00.000Z',
        deleted_datetime: null,
        id: 0,
        name: 'some name',
        emoji: null,
        type: AnalyticsCustomReportType.Custom,
        updated_by: 0,
        updated_datetime: '2025-01-01T00:00:00.000Z',
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

    it('should create a Dashboard with subset of props', () => {
        const expectedReport: DashboardSchema = {
            analytics_filter_id: apiReportWithoutChildren.analytics_filter_id,
            children: [],
            id: apiReportWithoutChildren.id,
            name: apiReportWithoutChildren.name,
            emoji: apiReportWithoutChildren.emoji,
        }
        const report = dashboardFromApi(apiReportWithoutChildren)

        expect(report).toEqual(expectedReport)
    })

    it('should create a Dashboard with children', () => {
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
        const expectedReport: DashboardSchema = {
            id: apiReportWithoutChildren.id,
            name: apiReportWithoutChildren.name,
            emoji: null,
            analytics_filter_id: apiReportWithoutChildren.analytics_filter_id,
            children: [
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Row,
                            children: [
                                {
                                    config_id: apiChart.config_id,
                                    type: DashboardChildType.Chart,
                                    metadata: {},
                                },
                            ],
                        },
                        {
                            config_id: apiChart.config_id,
                            type: DashboardChildType.Chart,
                            metadata: {},
                        },
                    ],
                },
                {
                    type: DashboardChildType.Row,
                    children: [],
                },
                {
                    config_id: apiChart.config_id,
                    type: DashboardChildType.Chart,
                    metadata: {},
                },
            ],
        }
        const report = dashboardFromApi(apiReportWithChildren)

        expect(report).toEqual(expectedReport)
    })

    it.skip('should ignore unknown types', () => {
        const unknownElement = {
            type: 'unknown',
        } as unknown as AnalyticsCustomReportChartSchema
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
        const expectedReport: DashboardSchema = {
            id: apiReportWithoutChildren.id,
            name: apiReportWithoutChildren.name,
            emoji: apiReportWithoutChildren.emoji,
            analytics_filter_id: apiReportWithoutChildren.analytics_filter_id,
            children: [
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Row,
                            children: [],
                        },
                    ],
                },
            ],
        }

        const report = dashboardFromApi(apiReportWithChildren)

        expect(report).toEqual(expectedReport)
    })

    it('should return undefined if it receives undefined', () => {
        expect(dashboardFromApi(undefined)).toEqual(undefined)
    })

    it('should return undefined when given an invalid dashboard', () => {
        expect(dashboardFromApi({} as any)).toBeUndefined()
    })

    it('should report error when given an invalid dashboard', () => {
        dashboardFromApi({} as any)

        expect(reportErrorMock).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                tags: { team: SentryTeam.CRM_REPORTING },
                extra: { validationErrors: expect.any(Array) },
            }),
        )
    })

    it('should preserve layout metadata from API chart', () => {
        const layout = {
            x: 2,
            y: 3,
            w: 2,
            h: 9,
        }

        const chartWithLayout: AnalyticsCustomReportChartSchema = {
            config_id: 'chart_with_layout',
            metadata: {
                layout,
            },
            type: AnalyticsCustomReportRowSchemaChildrenItemType.Chart,
        }

        const apiReportWithLayout = {
            ...apiReportWithoutChildren,
            children: [chartWithLayout],
        }

        const result = dashboardFromApi(apiReportWithLayout)

        expect(result?.children[0]).toEqual({
            type: DashboardChildType.Chart,
            config_id: 'chart_with_layout',
            metadata: {
                layout,
            },
        })
    })

    it('should handle charts without layout metadata', () => {
        const chartWithoutLayout: AnalyticsCustomReportChartSchema = {
            config_id: 'chart_without_layout',
            metadata: {},
            type: AnalyticsCustomReportRowSchemaChildrenItemType.Chart,
        }

        const apiReport = {
            ...apiReportWithoutChildren,
            children: [chartWithoutLayout],
        }

        const result = dashboardFromApi(apiReport)

        expect(result?.children[0]).toEqual({
            type: DashboardChildType.Chart,
            config_id: 'chart_without_layout',
            metadata: {},
        })
    })

    it('should handle charts with null layout in metadata', () => {
        const chartWithNullLayout: AnalyticsCustomReportChartSchema = {
            config_id: 'chart_null_layout',
            metadata: { layout: null } as any,
            type: AnalyticsCustomReportRowSchemaChildrenItemType.Chart,
        }

        const apiReport = {
            ...apiReportWithoutChildren,
            children: [chartWithNullLayout],
        }

        const result = dashboardFromApi(apiReport)

        expect(result?.children[0]).toEqual({
            type: DashboardChildType.Chart,
            config_id: 'chart_null_layout',
            metadata: {},
        })
    })

    it('should handle charts with completely undefined metadata property', () => {
        const chartWithUndefinedMetadata: AnalyticsCustomReportChartSchema = {
            config_id: 'chart_undefined_metadata',
            type: AnalyticsCustomReportRowSchemaChildrenItemType.Chart,
        } as any

        const result = dashboardChartChildFromApi(chartWithUndefinedMetadata)

        expect(result).toEqual({
            type: DashboardChildType.Chart,
            config_id: 'chart_undefined_metadata',
            metadata: {},
        })
    })
})

describe('getGroupChartsIntoRows', () => {
    it('should return an empty array if no charts are provided', () => {
        const result = getGroupChartsIntoRows([])

        expect(result).toEqual([])
    })

    it('should wrap charts into a row without metadata when no existing children provided', () => {
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

    it('should preserve metadata from existing children when provided', () => {
        const charts = ['chart1', 'chart2', 'chart3']
        const existingChildren: DashboardChild[] = [
            {
                type: DashboardChildType.Row,
                children: [
                    {
                        config_id: 'chart1',
                        type: DashboardChildType.Chart,
                        metadata: { layout: { x: 0, y: 0, w: 2, h: 9 } },
                    },
                    {
                        config_id: 'chart2',
                        type: DashboardChildType.Chart,
                        metadata: { layout: { x: 2, y: 0, w: 2, h: 9 } },
                    },
                ],
            },
        ]

        const result = getGroupChartsIntoRows(charts, existingChildren)

        expect(result[0]).toHaveProperty('children')
        const row = result[0] as DashboardRowSchema
        expect(row.children[0]).toMatchObject({
            config_id: 'chart1',
            metadata: { layout: { x: 0, y: 0, w: 2, h: 9 } },
        })
        expect(row.children[1]).toMatchObject({
            config_id: 'chart2',
            metadata: { layout: { x: 2, y: 0, w: 2, h: 9 } },
        })
        expect(row.children[2]).toEqual({
            config_id: 'chart3',
            type: 'chart',
        })
    })

    it('should handle nested structures when flattening charts', () => {
        const charts = ['chart1', 'chart2']
        const existingChildren: DashboardChild[] = [
            {
                type: DashboardChildType.Section,
                children: [
                    {
                        type: DashboardChildType.Row,
                        children: [
                            {
                                config_id: 'chart1',
                                type: DashboardChildType.Chart,
                                metadata: {
                                    layout: { x: 0, y: 0, w: 4, h: 22 },
                                },
                            },
                        ],
                    },
                ],
            },
        ]

        const result = getGroupChartsIntoRows(charts, existingChildren)

        expect(result[0]).toHaveProperty('children')
        const row = result[0] as DashboardRowSchema
        expect(row.children[0]).toMatchObject({
            config_id: 'chart1',
            metadata: { layout: { x: 0, y: 0, w: 4, h: 22 } },
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
                            reportName: SECTION_TITLES.AGENT_PERFORMANCE,
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
                                [OverviewChart.MessagesReceivedTrendCard]:
                                    SupportPerformanceOverviewReportConfig
                                        .charts[
                                        OverviewChart.MessagesReceivedTrendCard
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
        const report: DashboardSchema = {
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
        const report: DashboardSchema = {
            id: 2,
            name: 'Direct Charts',
            analytics_filter_id: 102,
            emoji: '📊',
            children: [
                {
                    type: DashboardChildType.Chart,
                    config_id: 'chart-1',
                },
                {
                    type: DashboardChildType.Chart,
                    config_id: 'chart-2',
                },
            ],
        }
        const result = getChildrenOfTypeChart(report)
        expect(result).toEqual([
            {
                type: DashboardChildType.Chart,
                config_id: 'chart-1',
            },
            {
                type: DashboardChildType.Chart,
                config_id: 'chart-2',
            },
        ])
    })

    it('should return nested chart children', () => {
        const report: DashboardSchema = {
            id: 3,
            name: 'Nested Charts',
            analytics_filter_id: 103,
            emoji: '🌐',
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart-1',
                        },
                    ],
                },
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Row,
                            children: [
                                {
                                    type: DashboardChildType.Chart,
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
                type: DashboardChildType.Chart,
                config_id: 'chart-1',
            },
            {
                type: DashboardChildType.Chart,
                config_id: 'chart-2',
            },
        ])
    })

    it('should handle mixed chart and non-chart children', () => {
        const report: DashboardSchema = {
            id: 4,
            name: 'Mixed Children',
            analytics_filter_id: 104,
            emoji: '🔥',
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart-1',
                        },
                    ],
                },
                {
                    type: DashboardChildType.Chart,
                    config_id: 'chart-2',
                },
            ],
        }
        const result = getChildrenOfTypeChart(report)
        expect(result).toEqual([
            {
                type: DashboardChildType.Chart,
                config_id: 'chart-1',
            },
            {
                type: DashboardChildType.Chart,
                config_id: 'chart-2',
            },
        ])
    })

    it('should handle null/undefined children', () => {
        const report: DashboardSchema = {
            id: 5,
            name: 'Null Children',
            analytics_filter_id: 105,
            emoji: null,
            children: [
                null,
                undefined,
                {
                    type: DashboardChildType.Chart,
                    config_id: 'chart-1',
                },
            ] as any,
        }
        const result = getChildrenOfTypeChart(report)
        expect(result).toEqual([
            {
                type: DashboardChildType.Chart,
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
    it('should create a dashboard with the correct payload', () => {
        const input: DashboardInput = {
            name: 'Test Dashboard',
            emoji: '🖖',
            analytics_filter_id: 123,
            children: [
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Row,
                            children: [
                                {
                                    type: DashboardChildType.Chart,
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
                    type: DashboardChildType.Section,
                    metadata: {},
                    children: [
                        {
                            type: DashboardChildType.Row,
                            metadata: {},
                            children: [
                                {
                                    type: DashboardChildType.Chart,
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
    it('should create a dashboard with the correct payload', () => {
        const dashboard: DashboardInput = {
            name: 'Test Dashboard',
            emoji: '🖖',
            analytics_filter_id: 123,
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [
                        {
                            type: DashboardChildType.Chart,
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
                    type: DashboardChildType.Row,
                    metadata: {},
                    children: [
                        {
                            type: DashboardChildType.Chart,
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

    it('should create an empty dashboard with the correct payload', () => {
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

    it('should preserve layout metadata in children', () => {
        const dashboard: DashboardInput = {
            name: 'Dashboard with Layout',
            children: [
                {
                    type: DashboardChildType.Chart,
                    config_id: 'chart_with_layout',
                    metadata: {
                        layout: {
                            x: 1,
                            y: 2,
                            w: 2,
                            h: 9,
                        },
                    },
                },
            ],
        }

        const result = createDashboardPayload(dashboard)

        expect(result.children[0]).toEqual({
            type: 'chart',
            config_id: 'chart_with_layout',
            metadata: {
                layout: {
                    x: 1,
                    y: 2,
                    w: 2,
                    h: 9,
                },
            },
        })
    })

    it('should handle charts without metadata', () => {
        const dashboard: DashboardInput = {
            name: 'Dashboard without Layout',
            children: [
                {
                    type: DashboardChildType.Chart,
                    config_id: 'chart_without_layout',
                },
            ],
        }

        const result = createDashboardPayload(dashboard)

        expect(result.children[0]).toEqual({
            type: 'chart',
            config_id: 'chart_without_layout',
            metadata: {},
        })
    })
})

describe('getChildrenIds', () => {
    it('should return an empty array if children is undefined', () => {
        const actual = getChildrenIds(undefined)

        expect(actual).toEqual([])
    })

    it('should return an array of children ids from a row', () => {
        const children: DashboardChild[] = [
            {
                type: DashboardChildType.Row,
                children: [
                    {
                        type: DashboardChildType.Chart,
                        config_id: 'config_id_1',
                    },
                    {
                        type: DashboardChildType.Chart,
                        config_id: 'config_id_2',
                    },
                ],
            },
        ]

        const actual = getChildrenIds(children)

        expect(actual).toEqual(['config_id_1', 'config_id_2'])
    })

    it('should return an array of children ids from charts', () => {
        const children: DashboardChild[] = [
            {
                type: DashboardChildType.Chart,
                config_id: 'config_id_1',
            },
            {
                type: DashboardChildType.Chart,
                config_id: 'config_id_2',
            },
        ]

        const actual = getChildrenIds(children)

        expect(actual).toEqual(['config_id_1', 'config_id_2'])
    })

    it('should return an array of children ids from different rows', () => {
        const children: DashboardChild[] = [
            {
                type: DashboardChildType.Row,
                children: [
                    {
                        type: DashboardChildType.Chart,
                        config_id: 'config_id_1',
                    },
                ],
            },
            {
                type: DashboardChildType.Row,
                children: [
                    {
                        type: DashboardChildType.Chart,
                        config_id: 'config_id_2',
                    },
                ],
            },
        ]

        const actual = getChildrenIds(children)

        expect(actual).toEqual(['config_id_1', 'config_id_2'])
    })

    it('should return an empty array for section', () => {
        const children: DashboardChild[] = [
            {
                type: DashboardChildType.Section,
                children: [
                    {
                        type: DashboardChildType.Row,
                        children: [
                            {
                                type: DashboardChildType.Chart,
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
    const chartToMove: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: 'chartToMoveId',
    }
    const targetChart: DashboardChartSchema = {
        type: DashboardChildType.Chart,
        config_id: 'targetChartId',
    }
    const dashboard: DashboardSchema = {
        id: 123,
        name: 'someName',
        emoji: null,
        analytics_filter_id: null,
        children: [
            {
                type: DashboardChildType.Row,
                children: [
                    chartToMove,
                    {
                        type: DashboardChildType.Chart,
                        config_id: 'someOtherChart',
                    },
                ],
            },
            {
                type: DashboardChildType.Section,
                children: [
                    {
                        type: DashboardChildType.Chart,
                        config_id: 'someBeforeTargetChart',
                    },
                    targetChart,
                    {
                        type: DashboardChildType.Chart,
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
            analytics_filter_id: null,
            emoji: null,
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'someOtherChart',
                        },
                    ],
                },
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'someBeforeTargetChart',
                        },
                        targetChart,
                        chartToMove,
                        {
                            type: DashboardChildType.Chart,
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
            analytics_filter_id: null,
            emoji: null,
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'someOtherChart',
                        },
                    ],
                },
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'someBeforeTargetChart',
                        },
                        chartToMove,
                        targetChart,
                        {
                            type: DashboardChildType.Chart,
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
            analytics_filter_id: null,
            emoji: null,
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [
                        chartToMove,
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'someOtherChart',
                        },
                    ],
                },
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'someBeforeTargetChart',
                        },
                        targetChart,
                        {
                            type: DashboardChildType.Chart,
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
            analytics_filter_id: null,
            emoji: null,
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'someOtherChart',
                        },
                    ],
                },
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'someBeforeTargetChart',
                        },
                        targetChart,
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'someAfterTargetChart',
                        },
                    ],
                },
            ],
        })
    })
})
