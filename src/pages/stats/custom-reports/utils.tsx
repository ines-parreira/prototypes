import {
    AnalyticsCustomReport,
    AnalyticsCustomReportChartSchema,
    AnalyticsCustomReportRowSchema,
    AnalyticsCustomReportSectionSchema,
} from '@gorgias/api-queries'
import {
    AnalyticsCustomReportChildrenItem,
    UpdateAnalyticsCustomReportBodyChildrenItem,
} from '@gorgias/api-types'
import React from 'react'

import {ChartConfig} from 'pages/stats/common/CustomReport/types'
import {REPORTS_MODAL_CONFIG} from 'pages/stats/custom-reports/config'
import {CustomReportChart} from 'pages/stats/custom-reports/CustomReportChart'
import {CustomReportRow} from 'pages/stats/custom-reports/CustomReportRow'
import {CustomReportSection} from 'pages/stats/custom-reports/CustomReportSection'
import {ReportsModalConfig} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {
    CustomReportSchema,
    CustomReportChartSchema,
    CustomReportChild,
    CustomReportChildType,
    CustomReportRowSchema,
    CustomReportSectionSchema,
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
