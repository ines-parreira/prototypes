import moment from 'moment/moment'

import {Metric} from 'hooks/reporting/metrics'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {OrderDirection} from 'models/api/types'
import {Period} from 'models/stat/types'
import {AutomatedInteractionByFeatures} from 'pages/stats/types'
import {
    AgentsPerformanceReportData,
    getData as getPerformanceData,
} from 'services/reporting/agentsPerformanceReportingService'
import {getPerformanceFeatureData} from 'services/reporting/automateOverviewReportingService'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {getData as getTicketInsightsData} from 'services/reporting/ticketFieldsReportingService'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {createCsv, saveZippedFiles} from 'utils/file'

export const AI_AGENT_PERFORMANCE_FILENAME = 'ai-agent-performance'
export const AI_AGENT_TICKET_INSIGHTS_FILENAME = 'ai-agent-ticket-insights'
export const AI_AGENT_AUTOMATED_TICKETS_FILENAME = 'ai-agent-automated-tickets'

export const AI_AGENT_METRICS_FILENAME = 'ai-agent-metrics'

export const saveReport = async (
    period: Period,
    performance: {
        data: AgentsPerformanceReportData
        summary: Omit<AgentsPerformanceReportData<Metric>, 'agents'>
        columnsOrder: AgentsTableColumn[]
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
    }
) => {
    const performanceData = getPerformanceData(
        performance.data,
        performance.summary,
        performance.columnsOrder
    )

    const ticketInsightsData =
        ticketInsights &&
        getTicketInsightsData(
            ticketInsights.data,
            ticketInsights.dateTimes,
            ticketInsights.order
        )

    const automatedTicketsData = getPerformanceFeatureData(
        automatedTickets.automateStatsMeasureLabelMap,
        automatedTickets.automatedInteractionByEventTypesTimeSeries
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
        `${periodPrefix}-${AI_AGENT_METRICS_FILENAME}-${export_datetime}`
    )
}
