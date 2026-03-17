import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import type { SLA_FORMAT } from 'domains/reporting/pages/sla/SlaConfig'
import type { OrderDirection } from 'models/api/types'
import type { DrillDownReportingQuery } from 'models/job/types'

export enum Domain {
    Voice = 'voice',
    Convert = 'convert',
    Ticket = 'ticket',
    AiSalesAgent = 'aiSalesAgent',
    AiAgent = 'aiAgent',
    AIJourney = 'aiJourney',
    Knowledge = 'knowledge',
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
