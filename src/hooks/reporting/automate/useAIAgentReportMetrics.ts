import { useMemo } from 'react'

import moment from 'moment'

import { User } from 'config/types/user'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { AutomateStatsMeasureLabelMap } from 'hooks/reporting/automate/automateStatsMeasureLabelMap'
import { useAutomateMetricsTimeSeries } from 'hooks/reporting/automate/useAutomationDataset'
import { calculateGreyArea } from 'hooks/reporting/automate/utils'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { useAgentsAverageMetrics } from 'hooks/reporting/support-performance/agents/useAgentsAverageMetrics'
import { useAgentsMetrics } from 'hooks/reporting/support-performance/agents/useAgentsMetrics'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useCustomFieldsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import { useAgentsTableConfigSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import { getPeriodDateTimes } from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { AutomationBillingEventMeasure } from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import { isAiAgentCustomField } from 'pages/aiAgent/util'
import { getTimeSeriesFormattedData } from 'pages/stats/automate/overview/utils'
import { activeParams } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import { formatDates } from 'pages/stats/utils'
import { getData as getPerformanceData } from 'services/reporting/agentsPerformanceReportingService'
import { formatPerformanceFeatureData } from 'services/reporting/automateOverviewReportingService'
import { formatData as getTicketInsightsData } from 'services/reporting/ticketFieldsReportingService'
import { getStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { getSortedAgents } from 'state/ui/stats/agentPerformanceSlice'
import { getCustomFieldsOrder } from 'state/ui/stats/ticketInsightsSlice'
import { createCsv } from 'utils/file'
import { getFilterDateRange } from 'utils/reporting'

export const AI_AGENT_REPORT_FILE_NAME = 'ai-agent-metrics'

export const AI_AGENT_PERFORMANCE_FILENAME = 'ai-agent-performance'
export const AI_AGENT_TICKET_INSIGHTS_FILENAME = 'ai-agent-ticket-insights'
export const AI_AGENT_AUTOMATED_TICKETS_FILENAME = 'ai-agent-automated-tickets'

export const useAgentPerformanceMetrics = () => {
    const agents = useAppSelector<User[]>(getSortedAgents)
    const { reportData, isLoading: reportIsLoading } = useAgentsMetrics()
    const { averageData, isLoading: summaryIsLoading } =
        useAgentsAverageMetrics()
    const { columnsOrder } = useAgentsTableConfigSetting()

    const loading = reportIsLoading || summaryIsLoading

    const performance = {
        data: reportData,
        average: averageData,
        total: averageData,
        columnsOrder,
    }

    return {
        agents,
        performance,
        performanceDataIsLoading: loading,
    }
}

export const useAutomatedTicketsMetrics = () => {
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)
    const automateStatsMeasureLabelMap = AutomateStatsMeasureLabelMap
    const { userTimezone, granularity } = useStatsFilters()

    const timeseries = useAutomateMetricsTimeSeries(
        statsFilters,
        userTimezone,
        granularity,
    )

    const greyArea = useMemo(
        () =>
            calculateGreyArea(
                moment(statsFilters.period.start_datetime),
                moment(statsFilters.period.end_datetime),
            ),
        [statsFilters.period.end_datetime, statsFilters.period.start_datetime],
    )

    const { exportableData } = useMemo(
        () => getTimeSeriesFormattedData(timeseries, granularity, greyArea),
        [granularity, greyArea, timeseries],
    )

    const automatedInteractionByEventTypesTimeSeries =
        exportableData.automatedInteractionByEventTypesTimeSeries.filter(
            (x) =>
                x[0].label ===
                AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent,
        )

    const automatedTicketsDataIsLoading = timeseries.isFetching
    const automatedTickets = {
        automateStatsMeasureLabelMap,
        automatedInteractionByEventTypesTimeSeries,
    }

    return {
        automatedTickets,
        automatedTicketsDataIsLoading,
    }
}

export const useTicketInsightsMetrics = (selectedCustomFieldId: number) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()
    const order = useAppSelector(getCustomFieldsOrder)

    const { data: timeSeriesData, isLoading: ticketInsightsDataIsLoading } =
        useCustomFieldsTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            selectedCustomFieldId,
        )

    const { data: { data: activeFields = [] } = {} } =
        useCustomFieldDefinitions(activeParams)

    const hasAiAgentCustomField = useMemo(
        () => activeFields.some(isAiAgentCustomField),
        [activeFields],
    )

    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(cleanStatsFilters.period),
        granularity,
    )

    const ticketInsights = hasAiAgentCustomField
        ? {
              data: timeSeriesData,
              dateTimes: dateTimes.map((item) =>
                  formatDates(granularity, item),
              ),
              order: order.direction,
          }
        : undefined

    return {
        ticketInsights,
        ticketInsightsDataIsLoading,
    }
}

export const useAIAgentReportMetrics = (selectedCustomFieldId: number) => {
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)

    const { agents, performance, performanceDataIsLoading } =
        useAgentPerformanceMetrics()

    const performanceData = getPerformanceData(
        agents,
        performance.data,
        performance.average,
        performance.total,
        performance.columnsOrder,
        [],
    )

    const { automatedTickets, automatedTicketsDataIsLoading } =
        useAutomatedTicketsMetrics()

    const automatedTicketsData = formatPerformanceFeatureData(
        automatedTickets.automateStatsMeasureLabelMap,
        automatedTickets.automatedInteractionByEventTypesTimeSeries,
    )

    const { ticketInsights, ticketInsightsDataIsLoading } =
        useTicketInsightsMetrics(selectedCustomFieldId)

    const ticketInsightsData =
        ticketInsights &&
        getTicketInsightsData(
            ticketInsights.data,
            ticketInsights.dateTimes,
            ticketInsights.order,
        )

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        AI_AGENT_REPORT_FILE_NAME,
    )

    const files = {
        [getCsvFileNameWithDates(
            statsFilters.period,
            AI_AGENT_PERFORMANCE_FILENAME,
        )]: createCsv(performanceData),
        [getCsvFileNameWithDates(
            statsFilters.period,
            AI_AGENT_AUTOMATED_TICKETS_FILENAME,
        )]: createCsv(automatedTicketsData),
        ...(ticketInsightsData !== undefined
            ? {
                  [getCsvFileNameWithDates(
                      statsFilters.period,
                      AI_AGENT_TICKET_INSIGHTS_FILENAME,
                  )]: createCsv(ticketInsightsData),
              }
            : {}),
    }

    return {
        files,
        fileName,
        isLoading:
            performanceDataIsLoading ||
            automatedTicketsDataIsLoading ||
            ticketInsightsDataIsLoading,
    }
}
