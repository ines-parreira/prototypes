import { OrderDirection } from 'models/api/types'
import { DrillDownReportingQuery } from 'models/job/types'
import { StatsFilters } from 'models/stat/types'
import { MetricValueFormat } from 'pages/stats/common/utils'
import { SLA_FORMAT } from 'pages/stats/sla/SlaConfig'

export enum Domain {
    Voice = 'voice',
    Convert = 'convert',
    Ticket = 'ticket',
    AiSalesAgent = 'aiSalesAgent',
}

export type DrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => DrillDownReportingQuery

export type ColumnConfig = {
    metricTitle: string
    showMetric: boolean
    metricValueFormat: MetricValueFormat | typeof SLA_FORMAT
}
