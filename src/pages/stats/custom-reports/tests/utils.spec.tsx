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
import {AxiosError} from 'axios'
import React from 'react'

import {REPORTS_MODAL_CONFIG} from 'pages/stats/custom-reports/config'
import {
    ChartConfig,
    CustomReportSchema,
    CustomReportChildType,
    DashboardInput,
} from 'pages/stats/custom-reports/types'
import {
    createDashboardPayload,
    customReportFromApi,
    getGroupChartsIntoRows,
    getNumberOfSelections,
    getSavedChartsIds,
    getSearchConfig,
    getErrorMessage,
} from 'pages/stats/custom-reports/utils'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'

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
                        {...apiRow, children: [{...apiChart}]},
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

        expect(result).toEqual([
            {
                children: [],
                metadata: {},
                type: 'row',
            },
        ])
    })

    it('should return a single row when the number of charts is less than or equal to chartsByRow', () => {
        const charts = ['chart1', 'chart2', 'chart3']

        const result = getGroupChartsIntoRows(charts)
        expect(result.length).toBe(1)
        expect(result[0]).toEqual({
            children: [
                {config_id: 'chart1', metadata: {}, type: 'chart'},
                {config_id: 'chart2', metadata: {}, type: 'chart'},
                {config_id: 'chart3', metadata: {}, type: 'chart'},
            ],
            metadata: {},
            type: 'row',
        })
    })

    it('should handle cases where the number of charts is exactly divisible by chartsByRow', () => {
        const charts = [
            'chart1',
            'chart2',
            'chart3',
            'chart4',
            'chart5',
            'chart6',
            'chart7',
            'chart8',
        ]
        const result = getGroupChartsIntoRows(charts)

        expect(result.length).toBe(2)
        expect(result[0]).toEqual({
            children: [
                {config_id: 'chart1', metadata: {}, type: 'chart'},
                {config_id: 'chart2', metadata: {}, type: 'chart'},
                {config_id: 'chart3', metadata: {}, type: 'chart'},
                {config_id: 'chart4', metadata: {}, type: 'chart'},
            ],
            metadata: {},
            type: 'row',
        })
        expect(result[1]).toEqual({
            children: [
                {config_id: 'chart5', metadata: {}, type: 'chart'},
                {config_id: 'chart6', metadata: {}, type: 'chart'},
                {config_id: 'chart7', metadata: {}, type: 'chart'},
                {config_id: 'chart8', metadata: {}, type: 'chart'},
            ],
            metadata: {},
            type: 'row',
        })
    })

    it('should return a row with a single chart if chartsByRow is greater than the number of charts', () => {
        const charts = ['chart1']
        const result = getGroupChartsIntoRows(charts, 10)

        expect(result.length).toBe(1)
        expect(result[0]).toEqual({
            children: [{config_id: 'chart1', metadata: {}, type: 'chart'}],
            metadata: {},
            type: 'row',
        })
    })

    it('should correctly group charts into rows with the given chartsByRow number', () => {
        const charts = [
            'chart1',
            'chart2',
            'chart3',
            'chart4',
            'chart5',
            'chart6',
            'chart7',
            'chart8',
        ]
        const result = getGroupChartsIntoRows(charts, 3)

        expect(result.length).toBe(3)
        expect(result[0]).toEqual({
            children: [
                {config_id: 'chart1', metadata: {}, type: 'chart'},
                {config_id: 'chart2', metadata: {}, type: 'chart'},
                {config_id: 'chart3', metadata: {}, type: 'chart'},
            ],
            metadata: {},
            type: 'row',
        })
        expect(result[1]).toEqual({
            children: [
                {config_id: 'chart4', metadata: {}, type: 'chart'},
                {config_id: 'chart5', metadata: {}, type: 'chart'},
                {config_id: 'chart6', metadata: {}, type: 'chart'},
            ],
            metadata: {},
            type: 'row',
        })
        expect(result[2]).toEqual({
            children: [
                {config_id: 'chart7', metadata: {}, type: 'chart'},
                {config_id: 'chart8', metadata: {}, type: 'chart'},
            ],
            metadata: {},
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
            icon: {name: 'chart1-icon', tooltip: 'Chart 1 tooltip'},
        },
        chart2: {
            chartComponent: () => <div>Chart 2</div>,
            label: 'Chart 2 Label',
            csvProducer: null,
            description: 'Description for chart 2',
            icon: {name: 'chart2-icon', tooltip: 'Chart 2 tooltip'},
        },
        chart3: {
            chartComponent: () => <div>Chart 3</div>,
            label: 'Chart 3 Label',
            csvProducer: null,
            description: 'Description for chart 3',
            icon: {name: 'chart3-icon', tooltip: 'Chart 3 tooltip'},
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
        const result = getSearchConfig(searchValue)

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
                ],
            },
        ])
    })

    it('should return null if no charts match the search query', () => {
        const searchValue = 'Nonexistent'
        const result = getSearchConfig(searchValue)

        expect(result).toEqual(null)
    })

    it('should correctly match partial chart labels', () => {
        const searchValue = 'Messages'
        const result = getSearchConfig(searchValue)

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
        const result = getSearchConfig(searchValue)

        expect(result).toEqual(REPORTS_MODAL_CONFIG)
    })
})

describe('getSavedChartsIds', () => {
    it('should return chart config_ids from the report children', () => {
        const report = {
            id: 1,
            name: 'Report 1',
            analytics_filter_id: 101,
            emoji: '📊',
            children: [
                {
                    type: CustomReportChildType.Chart,
                    config_id: 'chart-1',
                    children: [],
                },
                {
                    type: CustomReportChildType.Row,
                    config_id: 'chart-2',
                    children: [],
                },
            ],
        } as unknown as CustomReportSchema

        const result = getSavedChartsIds(report)
        expect(result).toEqual(['chart-1'])
    })

    it('should return chart config_ids from nested children', () => {
        const report: CustomReportSchema = {
            id: 2,
            name: 'Report 2',
            analytics_filter_id: 102,
            emoji: null,
            children: [
                {
                    type: CustomReportChildType.Row,
                    config_id: 'chart-2',
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'chart-3',
                            children: [],
                        },
                    ],
                },
                {
                    type: CustomReportChildType.Chart,
                    config_id: 'chart-1',
                    children: [],
                },
            ],
        } as unknown as CustomReportSchema

        const result = getSavedChartsIds(report)
        expect(result).toEqual(['chart-3', 'chart-1'])
    })

    it('should return an empty array when no charts are present', () => {
        const report: CustomReportSchema = {
            id: 3,
            name: 'Report 3',
            analytics_filter_id: 103,
            emoji: '🌐',
            children: [
                {
                    type: CustomReportChildType.Row,
                    config_id: 'chart-2',
                    children: [],
                },
                {
                    type: CustomReportChildType.Row,
                    config_id: 'chart-3',
                    children: [null as any],
                },
            ],
        } as unknown as CustomReportSchema

        const result = getSavedChartsIds(report)
        expect(result).toEqual([])
    })

    it('should handle empty children array', () => {
        const report: CustomReportSchema = {
            id: 4,
            name: 'Report 4',
            analytics_filter_id: 104,
            emoji: undefined,
            children: [],
        }

        const result = getSavedChartsIds(report)
        expect(result).toEqual([])
    })

    it('should handle null children in the report', () => {
        const report: CustomReportSchema = {
            id: 5,
            name: 'Report 5',
            analytics_filter_id: 105,
            emoji: '🔥',
            children: [
                null as any,
                undefined as any,
                {
                    type: CustomReportChildType.Chart,
                    config_id: 'chart-4',
                    children: [],
                },
            ],
        }

        const result = getSavedChartsIds(report)
        expect(result).toEqual(['chart-4'])
    })

    it('should return an empty array for reports with no children or charts', () => {
        const report: CustomReportSchema = {
            id: 6,
            name: 'Report 6',
            analytics_filter_id: 106,
            emoji: null,
            children: [],
        }

        const result = getSavedChartsIds(report)
        expect(result).toEqual([])
    })
})

const createError = (error: any) =>
    new AxiosError(undefined, undefined, undefined, undefined, {
        data: {error},
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
        const error = createError({msg})

        const actual = getErrorMessage(error)

        expect(actual).toBe(msg)
    })

    it('should construct error message from error data', () => {
        const msg = 'Bad Request.'
        const nameError = 'Name is missing.'
        const emojiErrors = ['Inappropriate emoji.']

        const error = createError({
            msg,
            data: {name: nameError, emoji: emojiErrors},
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
        const input = {name: 'Test Dashboard'}

        const expected = {
            name: 'Test Dashboard',
            emoji: null,
            analytics_filter_id: null,
            type: 'custom',
            children: [
                {
                    type: CustomReportChildType.Row,
                    metadata: {},
                    children: [
                        {
                            type: CustomReportChildType.Chart,
                            config_id: 'median_first_response_time_trend_card',
                            metadata: {},
                        },
                    ],
                },
            ],
        }

        const actual = createDashboardPayload(input)

        expect(actual).toEqual(expected)
    })
})
