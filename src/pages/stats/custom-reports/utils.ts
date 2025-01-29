import {
    AnalyticsCustomReport,
    AnalyticsCustomReportChartSchema,
    AnalyticsCustomReportRowSchema,
    AnalyticsCustomReportSectionSchema,
} from '@gorgias/api-queries'
import {
    AnalyticsCustomReportChartSchemaType,
    AnalyticsCustomReportChildrenItem,
    AnalyticsCustomReportRowSchemaType,
    AnalyticsCustomReportSectionSchemaType,
    CreateAnalyticsCustomReportBody,
    CreateAnalyticsCustomReportBodyChildrenItem,
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

export const getGroupChartsIntoRows = (
    charts: string[],
    chartsByRow: number = 4
): CustomReportChild[] => {
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
                type: CustomReportChildType.Chart,
            })),
        type: CustomReportChildType.Row,
    }))
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
        children: createChildrenWithMetadata(children || []),
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
    children:
        | CustomReportChild[]
        | AnalyticsCustomReportChildrenItem[]
        | undefined
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

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const removeChartById = <T extends CustomReportChild>(
    children: T[],
    chartId: string
): T[] => {
    const newChildren: T[] = []

    children.forEach((child) => {
        if (child.type === CustomReportChildType.Chart) {
            if (child.config_id !== chartId) {
                newChildren.push(child)
            }
        } else if (child.type === CustomReportChildType.Row) {
            newChildren.push({
                ...child,
                children: removeChartById(child.children, chartId),
            })
        } else if (child.type === CustomReportChildType.Section) {
            newChildren.push({
                ...child,
                children: removeChartById(child.children, chartId),
            })
        }
    })

    return newChildren
}

const findChartById = (
    children: CustomReportChild[],
    chartId: string
): CustomReportChartSchema | undefined => {
    let chart: CustomReportChartSchema | undefined

    children.forEach((child) => {
        if (child.type === CustomReportChildType.Chart) {
            if (child.config_id === chartId) {
                chart = child
            }
        } else {
            const localChart = findChartById(child.children, chartId)
            if (localChart) {
                chart = localChart
            }
        }
    })

    return chart
}

const findChartIndexById = (children: CustomReportChild[], chartId: string) => {
    return children.findIndex((child) => {
        return (
            child.type === CustomReportChildType.Chart &&
            child.config_id === chartId
        )
    })
}

const insertChart = <T extends CustomReportChild>(
    children: T[],
    targetChartId: string,
    chart: CustomReportChartSchema,
    position: 'before' | 'after'
): T[] => {
    const foundIndex = findChartIndexById(children, targetChartId)

    if (foundIndex > -1) {
        const targetIndex = position === 'before' ? foundIndex : foundIndex + 1

        children.splice(targetIndex, 0, chart as T)
        return [...children]
    }

    return children.map((child) => {
        if (child.type !== CustomReportChildType.Chart) {
            return {
                ...child,
                children: insertChart(
                    child.children,
                    targetChartId,
                    chart,
                    position
                ),
            }
        }

        return child
    })
}

export const updateChartPosition = (
    dashboard: CustomReportSchema,
    subjectChartId: string,
    targetChartId: string,
    position: 'before' | 'after'
) => {
    const dashboardCopy = deepClone(dashboard)
    const chart = findChartById(dashboardCopy.children, subjectChartId)

    if (!chart) return dashboard

    const childrenWithoutChart = removeChartById(
        dashboardCopy.children,
        subjectChartId
    )

    const childrenWithChart = insertChart(
        childrenWithoutChart,
        targetChartId,
        chart,
        position
    )

    return {
        ...dashboardCopy,
        children: childrenWithChart,
    }
}
