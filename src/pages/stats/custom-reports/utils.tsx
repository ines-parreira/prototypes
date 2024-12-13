import {
    AnalyticsCustomReport,
    AnalyticsCustomReportChartSchema,
    AnalyticsCustomReportRowSchema,
    AnalyticsCustomReportSectionSchema,
} from '@gorgias/api-queries'
import {AnalyticsCustomReportChildrenItem} from '@gorgias/api-types'

import React from 'react'

import {CustomReportChart} from 'pages/stats/custom-reports/CustomReportChart'
import {CustomReportRow} from 'pages/stats/custom-reports/CustomReportRow'
import {CustomReportSection} from 'pages/stats/custom-reports/CustomReportSection'
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
    report: AnalyticsCustomReport
): CustomReportSchema => {
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
