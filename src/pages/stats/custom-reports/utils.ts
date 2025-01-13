import {
    AnalyticsCustomReport,
    AnalyticsCustomReportChartSchema,
    AnalyticsCustomReportRowSchema,
    AnalyticsCustomReportSectionSchema,
} from '@gorgias/api-queries'
import {
    AnalyticsCustomReportChildrenItem,
    UpdateAnalyticsCustomReportBodyChildrenItem,
    UpdateAnalyticsCustomReportBody,
} from '@gorgias/api-types'
import _flatten from 'lodash/flatten'

import {isGorgiasApiError} from 'models/api/types'
import {
    ChartConfig,
    CustomReportChartSchema,
    CustomReportChild,
    CustomReportChildType,
    CustomReportRowSchema,
    CustomReportSchema,
    CustomReportSectionSchema,
    DashboardInput,
} from 'pages/stats/custom-reports/types'
import {notNull} from 'utils/types'

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
        case CustomReportChildType.Section:
            return fromApiSection(child)
        case CustomReportChildType.Row:
            return fromApiRow(child)
        case CustomReportChildType.Chart:
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
    if (!charts.length) {
        return []
    }
    const rowsLength = Math.ceil(charts.length / chartsByRow)
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

export const createDashboardPayload = ({
    dashboard,
    chartIds,
}: {
    dashboard: DashboardInput
    chartIds?: string[]
}): UpdateAnalyticsCustomReportBody => {
    const {name, emoji, analytics_filter_id, children} = dashboard
    return {
        name,
        emoji: emoji ?? null,
        // FIXME: This is a known issue in the API. It should accept null values
        // Remove type casting when the API is fixed, related tickets: #3195 & #3196
        analytics_filter_id: (analytics_filter_id ?? null) as unknown as number,
        type: 'custom',
        children: getGroupChartsIntoRows(chartIds || getChildrenIds(children)),
    }
}

export const getChildrenOfTypeChart = (report: CustomReportSchema) => {
    const result: CustomReportChartSchema[] = []
    for (const child of report.children) {
        if (!child) continue

        if (child.type === CustomReportChildType.Chart) {
            result.push(child)
        } else {
            for (const subChild of child.children) {
                if (subChild.type === CustomReportChildType.Chart) {
                    result.push(subChild)
                } else {
                    for (const subSubChild of subChild.children) {
                        result.push(subSubChild)
                    }
                }
            }
        }
    }

    return result
}

export const getChildrenIds = (
    children: CustomReportChild[] | undefined
): string[] => {
    return children
        ? _flatten(
              children?.map((secondChild) => {
                  if (secondChild.type === CustomReportChildType.Row)
                      return secondChild.children.map(
                          (thirdChild) => thirdChild.config_id
                      )
                  if (secondChild.type === CustomReportChildType.Chart)
                      return secondChild.config_id
                  return []
              })
          )
        : []
}
