import { StatsFilters } from 'domains/reporting/models/stat/types'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { SLA_FORMAT } from 'domains/reporting/pages/sla/SlaConfig'
import { OrderDirection } from 'models/api/types'
import { DrillDownReportingQuery } from 'models/job/types'

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
