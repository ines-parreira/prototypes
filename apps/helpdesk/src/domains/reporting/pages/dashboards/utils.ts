import { reportError } from '@repo/logging'
import _flatten from 'lodash/flatten'

import type {
    AnalyticsCustomReport,
    AnalyticsCustomReportChartSchema,
    AnalyticsCustomReportRowSchema,
    AnalyticsCustomReportSectionSchema,
} from '@gorgias/helpdesk-queries'
import type { CreateAnalyticsCustomReportBody } from '@gorgias/helpdesk-types'
import {
    AnalyticsCustomReportChartSchemaType,
    AnalyticsCustomReportRowSchemaType,
    AnalyticsCustomReportSectionSchemaType,
} from '@gorgias/helpdesk-types'
import { validateAnalyticsCustomReport } from '@gorgias/helpdesk-validators'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type {
    ChartConfig,
    ChartLayoutMetadata,
    DashboardChartSchema,
    DashboardChild,
    DashboardInput,
    DashboardRowSchema,
    DashboardSchema,
    DashboardSectionSchema,
    ReportChildrenConfig,
    ReportsModalConfig,
} from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { isGorgiasApiError } from 'models/api/types'
import { BASE_STATS_PATH, STATS_ROUTES } from 'routes/constants'
import { notNull } from 'utils/types'

const fromApiChart = (
    chart: AnalyticsCustomReportChartSchema,
): DashboardChartSchema => {
    if (chart.metadata?.layout) {
        return {
            config_id: chart.config_id,
            type: DashboardChildType.Chart,
            metadata: {
                layout: chart.metadata.layout as ChartLayoutMetadata,
            },
        }
    }

    return {
        config_id: chart.config_id,
        type: DashboardChildType.Chart,
        metadata: {},
    }
}

const fromApiRow = (
    row: AnalyticsCustomReportRowSchema,
): DashboardRowSchema => ({
    children: row.children.map(dashboardChartChildFromApi).filter(notNull),
    type: DashboardChildType.Row,
})

const fromApiSection = (
    section: AnalyticsCustomReportSectionSchema,
): DashboardSectionSchema => ({
    children: section.children
        .map(dashboardSectionChildFromApi)
        .filter(notNull),
    type: DashboardChildType.Section,
})

export const dashboardChartChildFromApi = (
    child:
        | AnalyticsCustomReportSectionSchema
        | AnalyticsCustomReportRowSchema
        | AnalyticsCustomReportChartSchema,
): DashboardChartSchema | null => {
    switch (child.type) {
        case 'chart':
            return fromApiChart(child)
        default:
            return null
    }
}

export const dashboardSectionChildFromApi = (
    child:
        | AnalyticsCustomReportSectionSchema
        | AnalyticsCustomReportRowSchema
        | AnalyticsCustomReportChartSchema,
): DashboardRowSchema | DashboardChartSchema | null => {
    switch (child.type) {
        case 'row':
            return fromApiRow(child)
        case 'chart':
            return fromApiChart(child)
        default:
            return null
    }
}

export const dashboardChildFromApi = (
    child:
        | AnalyticsCustomReportSectionSchema
        | AnalyticsCustomReportRowSchema
        | AnalyticsCustomReportChartSchema,
): DashboardChild | null => {
    switch (child.type) {
        case DashboardChildType.Section:
            return fromApiSection(child)
        case DashboardChildType.Row:
            return fromApiRow(child)
        case DashboardChildType.Chart:
            return fromApiChart(child)
        default:
            return null
    }
}

export const dashboardFromApi = (
    maybeReport?: AnalyticsCustomReport,
): DashboardSchema | undefined => {
    if (!maybeReport) return undefined

    const validation = validateAnalyticsCustomReport(maybeReport)
    if (!validation.isValid) {
        reportError(new Error('Invalid dashboard'), {
            tags: { team: SentryTeam.CRM_REPORTING },
            extra: { validationErrors: validation.errors },
        })

        return undefined
    }

    const report = validation.data

    return {
        analytics_filter_id: report.analytics_filter_id,
        id: report.id,
        name: report.name,
        emoji: report.emoji,
        children: report.children
            .map((child) => dashboardChildFromApi(child))
            .filter(notNull),
    }
}

export const getNumberOfSelections = (
    charts: Record<string, ChartConfig>,
    checkedCharts: string[],
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
    defaultMessage = 'Oops! Something went wrong.',
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

export const flattenCharts = (
    children: DashboardChild[],
): DashboardChartSchema[] => {
    return children.flatMap((child: DashboardChild) => {
        switch (child.type) {
            case DashboardChildType.Row:
            case DashboardChildType.Section:
                return flattenCharts(child.children)
            case DashboardChildType.Chart:
                return [child]
        }
    })
}

export const getGroupChartsIntoRows = (
    charts: string[],
    existingChildren?: DashboardChild[],
): DashboardChild[] => {
    if (!charts.length) {
        return []
    }

    const metadataMap = new Map<string, DashboardChartSchema['metadata']>()
    if (existingChildren) {
        const existingCharts = flattenCharts(existingChildren)
        existingCharts.forEach((chart) => {
            if (chart.metadata) {
                metadataMap.set(chart.config_id, chart.metadata)
            }
        })
    }

    return [
        {
            type: DashboardChildType.Row,
            children: charts.map((chartId) => {
                const existingMetadata = metadataMap.get(chartId)
                return {
                    config_id: chartId,
                    type: DashboardChildType.Chart,
                    ...(existingMetadata && { metadata: existingMetadata }),
                }
            }),
        },
    ]
}

const createChildrenWithMetadata = (
    children: DashboardChild[],
): (
    | AnalyticsCustomReportSectionSchema
    | AnalyticsCustomReportRowSchema
    | AnalyticsCustomReportChartSchema
)[] => {
    return children.map((child) => {
        switch (child.type) {
            case DashboardChildType.Chart:
                return {
                    type: AnalyticsCustomReportChartSchemaType.Chart,
                    config_id: child.config_id,
                    metadata: child.metadata || {},
                } as AnalyticsCustomReportChartSchema

            case DashboardChildType.Row:
                return {
                    type: AnalyticsCustomReportRowSchemaType.Row,
                    metadata: {},
                    children: createChildrenWithMetadata(child.children),
                } as AnalyticsCustomReportRowSchema

            case DashboardChildType.Section:
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
        analytics_filter_id: analytics_filter_id ?? null,
        type: 'custom',
        children: createChildrenWithMetadata(children || []),
    }
}

export const getChildrenOfTypeChart = (report: DashboardSchema) => {
    const result: DashboardChartSchema[] = []
    for (const child of report.children) {
        if (!child) continue

        if (child.type === DashboardChildType.Chart) {
            result.push(child)
        } else {
            for (const subChild of child.children) {
                if (subChild.type === DashboardChildType.Chart) {
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
        | DashboardChild[]
        | (
              | AnalyticsCustomReportSectionSchema
              | AnalyticsCustomReportRowSchema
              | AnalyticsCustomReportChartSchema
          )[]
        | undefined,
): string[] => {
    return children
        ? _flatten(
              children?.map((secondChild) => {
                  if (secondChild.type === DashboardChildType.Row)
                      return secondChild.children.map(
                          (thirdChild) => thirdChild.config_id,
                      )
                  if (secondChild.type === DashboardChildType.Chart)
                      return secondChild.config_id
                  return []
              }),
          )
        : []
}

export const getDashboardPath = (id: number) =>
    [
        BASE_STATS_PATH,
        STATS_ROUTES.DASHBOARDS_PAGE.replace(':id', String(id)),
    ].join('/')

export const getReportsConfigSearchResult = (
    config: ReportsModalConfig,
    searchTerm: string,
): ReportsModalConfig | null => {
    const searchValue = searchTerm.toLowerCase()

    const filteredConfig: ReportsModalConfig = []

    config.forEach((reportConfig) => {
        const filteredChildren: ReportChildrenConfig = []

        for (const report of reportConfig.children) {
            const filteredCharts: Record<string, ChartConfig> = {}

            for (const [chartId, chart] of Object.entries(
                report.config.charts,
            )) {
                if (String(chart.label).toLowerCase().includes(searchValue)) {
                    filteredCharts[chartId] = chart
                }
            }

            if (Object.keys(filteredCharts).length > 0) {
                filteredChildren.push({
                    type: report.type,
                    ...(report.hidden !== undefined && {
                        hidden: report.hidden,
                    }),
                    config: {
                        ...report.config,
                        charts: filteredCharts,
                    },
                })
            }
        }

        if (filteredChildren.length > 0) {
            filteredConfig.push({
                category: reportConfig.category,
                children: filteredChildren,
            })
        }
    })

    return filteredConfig.length ? filteredConfig : null
}
