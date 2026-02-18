import moment from 'moment/moment'

import type { User } from 'config/types/user'
import type { Metric } from 'domains/reporting/hooks/metrics'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import type { Period } from 'domains/reporting/models/stat/types'
import type { AutomatedInteractionByFeatures } from 'domains/reporting/pages/types'
import type { AgentsPerformanceReportData } from 'domains/reporting/services/agentsPerformanceReportingService'
import { getData as getPerformanceData } from 'domains/reporting/services/agentsPerformanceReportingService'
import { formatPerformanceFeatureData } from 'domains/reporting/services/automateOverviewReportingService'
import { DATE_TIME_FORMAT } from 'domains/reporting/services/constants'
import { formatData as getTicketInsightsData } from 'domains/reporting/services/ticketFieldsReportingService'
import type {
    AgentsTableColumn,
    AgentsTableRow,
} from 'domains/reporting/state/ui/stats/types'
import type { OrderDirection } from 'models/api/types'
import { createCsv, saveZippedFiles } from 'utils/file'

export const AI_AGENT_PERFORMANCE_FILENAME = 'ai-agent-performance'
export const AI_AGENT_TICKET_INSIGHTS_FILENAME = 'ai-agent-ticket-insights'
export const AI_AGENT_AUTOMATED_TICKETS_FILENAME = 'ai-agent-automated-tickets'

export const AI_AGENT_METRICS_FILENAME = 'ai-agent-metrics'

export const saveReport = async (
    agents: User[],
    period: Period,
    performance: {
        data: AgentsPerformanceReportData
        summary: Omit<AgentsPerformanceReportData<Metric>, 'agents'>
        total: Omit<AgentsPerformanceReportData<Metric>, 'agents'>
        columnsOrder: AgentsTableColumn[]
        rowsOrder: AgentsTableRow[]
    },
    automatedTickets: {
        automateStatsMeasureLabelMap: Record<
            AutomatedInteractionByFeatures,
            string
        >
        automatedInteractionByEventTypesTimeSeries: TimeSeriesDataItem[][]
    },
    ticketInsights?: {
        data: Record<string, TimeSeriesDataItem[][]> | undefined
        dateTimes: string[]
        order?: OrderDirection
    },
) => {
    const performanceData = getPerformanceData(
        agents,
        performance.data,
        performance.summary,
        performance.total,
        performance.columnsOrder,
        performance.rowsOrder,
    )

    const ticketInsightsData =
        ticketInsights &&
        getTicketInsightsData(
            ticketInsights.data,
            ticketInsights.dateTimes,
            ticketInsights.order,
        )

    const automatedTicketsData = formatPerformanceFeatureData(
        automatedTickets.automateStatsMeasureLabelMap,
        automatedTickets.automatedInteractionByEventTypesTimeSeries,
    )

    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-${AI_AGENT_PERFORMANCE_FILENAME}-${export_datetime}.csv`]:
                createCsv(performanceData),

            ...(ticketInsightsData !== undefined
                ? {
                      [`${periodPrefix}-${AI_AGENT_TICKET_INSIGHTS_FILENAME}-${export_datetime}.csv`]:
                          createCsv(ticketInsightsData),
                  }
                : {}),

            [`${periodPrefix}-${AI_AGENT_AUTOMATED_TICKETS_FILENAME}-${export_datetime}.csv`]:
                createCsv(automatedTicketsData),
        },
        `${periodPrefix}-${AI_AGENT_METRICS_FILENAME}-${export_datetime}`,
    )
}
