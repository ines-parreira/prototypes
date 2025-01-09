import {FunctionComponent, ReactNode} from 'react'

import {MetricPerDimensionFetch} from 'hooks/reporting/distributions'
import {MetricTrendFetch} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesFetch} from 'hooks/reporting/useTimeSeries'
import {StaticFilter} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import {ServiceLevelAgreementsChart} from 'pages/stats/sla/ServiceLevelAgreementsConfig'
import {AgentsChart} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {BusiestTimesChart} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import {ChannelsChart} from 'pages/stats/support-performance/channels/ChannelsReportConfig'
import {OverviewChart} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'

type FilterSettings = {
    optional: OptionalFilter[]
    persistent: StaticFilter[]
}

export enum CustomReportChildType {
    Row = 'row',
    Section = 'section',
    Chart = 'chart',
}

export enum ChartType {
    Card = 'card',
    Graph = 'graph',
    Table = 'table',
}

export type CustomReportRowSchema = {
    type: CustomReportChildType.Row
    children: CustomReportChartSchema[]
}

export type CustomReportSectionSchema = {
    type: CustomReportChildType.Section
    children: (CustomReportRowSchema | CustomReportChartSchema)[]
}

export type CustomReportChartSchema = {
    type: CustomReportChildType.Chart
    config_id: string
}

export type CustomReportChild =
    | CustomReportRowSchema
    | CustomReportSectionSchema
    | CustomReportChartSchema

export type CustomReportSchema = {
    id: number
    name: string
    analytics_filter_id: number | null
    children: CustomReportChild[]
    emoji: string | null | undefined
}

export type DashboardInput = {
    name: string
    emoji?: string | null
    analytics_filter_id?: number | null
    children?: CustomReportChild[]
}

type DataExportFetch =
    | MetricTrendFetch
    | TimeSeriesFetch
    | MetricPerDimensionFetch[]

export type ChartConfig = {
    chartComponent: FunctionComponent
    label: ReactNode
    csvProducer: DataExportFetch | null
    description: ReactNode
    icon: {name: string; tooltip: string}
}

export type ReportConfig<T extends string> = {
    reportName: string
    reportPath: string
    charts: Record<T, ChartConfig>
    reportFilters: FilterSettings
}

export type AvailableChartIds =
    | typeof OverviewChart
    | typeof AgentsChart
    | typeof BusiestTimesChart
    | typeof ChannelsChart
    | typeof ServiceLevelAgreementsChart

export type ReportChildrenConfig = {
    type: AvailableChartIds
    config: ReportConfig<string>
}[]

export type ReportsModalConfig = {
    category: string
    children: ReportChildrenConfig
}[]
