import {
    AnalyticsCustomReport,
    AnalyticsCustomReportChartSchema,
    AnalyticsCustomReportRowSchema,
    AnalyticsCustomReportSectionSchema,
} from '@gorgias/api-queries'
import {
    AnalyticsCustomReportChildrenItem,
    UpdateAnalyticsCustomReportBodyChildrenItem,
    AnalyticsCustomReportChartSchemaType,
    AnalyticsCustomReportRowSchemaType,
    AnalyticsCustomReportSectionSchemaType,
    CreateAnalyticsCustomReportBody,
    CreateAnalyticsCustomReportBodyChildrenItem,
} from '@gorgias/api-types'
import React from 'react'

import {isGorgiasApiError} from 'models/api/types'
import {ChartConfig} from 'pages/stats/common/CustomReport/types'
import {REPORTS_MODAL_CONFIG} from 'pages/stats/custom-reports/config'

import {CustomReportChart} from 'pages/stats/custom-reports/CustomReportChart'
import {CustomReportRow} from 'pages/stats/custom-reports/CustomReportRow'
import {CustomReportSection} from 'pages/stats/custom-reports/CustomReportSection'
import {ReportsModalConfig} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {
    CustomReportChartSchema,
    CustomReportChild,
    CustomReportChildType,
    CustomReportRowSchema,
    CustomReportSchema,
    CustomReportSectionSchema,
    DashboardInput,
} from 'pages/stats/custom-reports/types'
import {notNull} from 'utils/types'

export const renderCustomReportChild = (
    child: CustomReportChild,
    key: string
) => {
    switch (child.type) {
        case CustomReportChildType.Row:
            return (
                <CustomReportRow schema={child} key={key}>
                    {child.children.map(renderCustomReportChildWithKeys)}
                </CustomReportRow>
            )
        case CustomReportChildType.Section:
            return (
                <CustomReportSection schema={child} key={child.type}>
                    {child.children.map(renderCustomReportChildWithKeys)}
                </CustomReportSection>
            )
        case CustomReportChildType.Chart:
            return <CustomReportChart schema={child} key={child.type} />
    }
}

export const renderCustomReportChildWithKeys = (
    child: CustomReportChild,
    index: number
) => renderCustomReportChild(child, `${child.type}-${index}`)

const fromApiChart = (
    chart: AnalyticsCustomReportChartSchema
): CustomReportChartSchema => ({
    config_id: chart.config_id,
    type: CustomReportChildType.Chart,
})

const fromApiRow = (
    row: AnalyticsCustomReportRowSchema
): CustomReportRowSchema => ({
    children: row.children.map(customReportChartChildFromApi).filter(notNull),
    type: CustomReportChildType.Row,
})

const fromApiSection = (
    section: AnalyticsCustomReportSectionSchema
): CustomReportSectionSchema => ({
    children: section.children
        .map(customReportSectionChildFromApi)
        .filter(notNull),
    type: CustomReportChildType.Section,
})

export const customReportChartChildFromApi = (
    child: AnalyticsCustomReportChildrenItem
): CustomReportChartSchema | null => {
    switch (child.type) {
        case 'chart':
            return fromApiChart(child)
        default:
            return null
    }
}

export const customReportSectionChildFromApi = (
    child: AnalyticsCustomReportChildrenItem
): CustomReportRowSchema | CustomReportChartSchema | null => {
    switch (child.type) {
        case 'row':
            return fromApiRow(child)
        case 'chart':
            return fromApiChart(child)
        default:
            return null
    }
}

export const customReportChildFromApi = (
    child: AnalyticsCustomReportChildrenItem
): CustomReportChild | null => {
    switch (child.type) {
        case 'section':
            return fromApiSection(child)
        case 'row':
            return fromApiRow(child)
        case 'chart':
            return fromApiChart(child)
        default:
            return null
    }
}

export const customReportFromApi = (
    report?: AnalyticsCustomReport
): CustomReportSchema | undefined => {
    if (!report) {
        return undefined
    }
    return {
        analytics_filter_id: report.analytics_filter_id,
        id: report.id,
        name: report.name,
        emoji: report.emoji,
        children: report.children
            .map((child) => customReportChildFromApi(child))
            .filter(notNull),
    }
}

export const getSavedChartsIds = (report: CustomReportSchema) => {
    const savedIds: string[] = []

    report?.children?.forEach((child) => {
        if (child?.type === CustomReportChildType.Chart) {
            savedIds.push(child.config_id)
        } else {
            child?.children?.forEach((chart) => {
                if (chart && chart.type === CustomReportChildType.Chart) {
                    savedIds.push(chart.config_id)
                }
            })
        }
    })

    return savedIds
}

export const getGroupChartsIntoRows = (
    charts: string[],
    chartsByRow: number = 4
): UpdateAnalyticsCustomReportBodyChildrenItem[] => {
    const rowsLength = charts.length
        ? Math.ceil(charts.length / chartsByRow)
        : 1
    return Array.from({
        length: rowsLength,
    }).map((_, index) => ({
        children: charts
            .slice(index * chartsByRow, (index + 1) * chartsByRow)
            .map((chartId) => ({
                config_id: chartId,
                metadata: {},
                type: CustomReportChildType.Chart,
            })),
        type: CustomReportChildType.Row,
        metadata: {},
    }))
}

export const getSearchConfig = (value: string) => {
    const config: ReportsModalConfig = []
    REPORTS_MODAL_CONFIG.forEach((category) => {
        category.children.forEach((report) => {
            const similarCharts: Record<string, ChartConfig> = {}

            Object.entries(report.charts).forEach(([chartId, chart]) => {
                if (
                    String(chart.label)
                        .toLowerCase()
                        .includes(value.toLowerCase())
                ) {
                    similarCharts[chartId] = chart
                }
            })

            if (Object.keys(similarCharts).length) {
                config.push({
                    category: category.category,
                    children: [
                        {
                            ...report,
                            charts: similarCharts,
                        },
                    ],
                })
            }
        })
    })
    return config
}

export const getNumberOfSelections = (
    charts: Record<string, ChartConfig>,
    checkedCharts: string[]
): number =>
    Object.keys(charts).reduce((acc, chartId) => {
        let total = acc
        checkedCharts.forEach((currentChartId) => {
            if (currentChartId === chartId) {
                total += 1
            }
        })
        return total
    }, 0)

function isObjectWithKeys(data: unknown): data is Record<string, unknown> {
    return (
        typeof data === 'object' &&
        data !== null &&
        !Array.isArray(data) &&
        Object.keys(data).length > 0
    )
}

export function getErrorMessage(
    error: unknown,
    defaultMessage = 'Oops! Something went wrong.'
) {
    if (isGorgiasApiError(error)) {
        const responseError = error.response.data
        let message = responseError.error.msg
        const data = responseError.error.data
        if (isObjectWithKeys(data)) {
            Object.keys(data).forEach((key) => {
                const value = data[key]

                if (typeof value === 'string') {
                    message += ' ' + value
                    return
                }

                if (Array.isArray(value)) {
                    message += ' ' + value.join(' ')
                    return
                }
            })
        }
        return message
    }

    if (error instanceof Error) {
        return error.message
    }

    return defaultMessage
}

const createChildrenWithMetadata = (
    children: CustomReportChild[]
): CreateAnalyticsCustomReportBodyChildrenItem[] => {
    return children.map((child) => {
        switch (child.type) {
            case CustomReportChildType.Chart:
                return {
                    type: AnalyticsCustomReportChartSchemaType.Chart,
                    config_id: child.config_id,
                    metadata: {},
                } as AnalyticsCustomReportChartSchema

            case CustomReportChildType.Row:
                return {
                    type: AnalyticsCustomReportRowSchemaType.Row,
                    metadata: {},
                    children: createChildrenWithMetadata(child.children),
                } as AnalyticsCustomReportRowSchema

            case CustomReportChildType.Section:
                return {
                    type: AnalyticsCustomReportSectionSchemaType.Section,
                    metadata: {},
                    children: createChildrenWithMetadata(child.children),
                } as AnalyticsCustomReportSectionSchema
        }
    })
}

const dummyChildren: CustomReportChild[] = [
    {
        type: CustomReportChildType.Row,
        children: [
            {
                type: CustomReportChildType.Chart,
                config_id: 'median_first_response_time_trend_card',
            },
        ],
    },
]

export const createDashboardPayload = ({
    name,
    emoji,
    analytics_filter_id,
    children,
}: DashboardInput): CreateAnalyticsCustomReportBody => {
    return {
        name,
        emoji: emoji ?? null,
        // FIXME: This is a known issue in the API. It should accept null values
        // Remove type casting when the API is fixed, related tickets: #3195 & #3196
        analytics_filter_id: (analytics_filter_id ?? null) as unknown as number,
        type: 'custom',
        children: createChildrenWithMetadata(children ?? dummyChildren),
    }
}
