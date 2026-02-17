import { useMemo } from 'react'

import { createCsv } from '@repo/utils'
import moment from 'moment'

import type { User } from 'config/types/user'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { AutomateStatsMeasureLabelMap } from 'domains/reporting/hooks/automate/automateStatsMeasureLabelMap'
import { useAutomateMetricsTimeSeries } from 'domains/reporting/hooks/automate/useAutomationDataset'
import { calculateGreyArea } from 'domains/reporting/hooks/automate/utils'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { getPeriodDateTimes } from 'domains/reporting/hooks/helpers'
import { useAgentsAverageMetrics } from 'domains/reporting/hooks/support-performance/agents/useAgentsAverageMetrics'
import { useAgentsMetrics } from 'domains/reporting/hooks/support-performance/agents/useAgentsMetrics'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useCustomFieldsTicketCountTimeSeries } from 'domains/reporting/hooks/timeSeries'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import { AutomationBillingEventMeasure } from 'domains/reporting/models/cubes/automate/AutomationBillingEventCube'
import { getTimeSeriesFormattedData } from 'domains/reporting/pages/automate/overview/utils'
import { activeParams } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import { formatDates } from 'domains/reporting/pages/utils'
import { getData as getPerformanceData } from 'domains/reporting/services/agentsPerformanceReportingService'
import { formatPerformanceFeatureData } from 'domains/reporting/services/automateOverviewReportingService'
import { formatData as getTicketInsightsData } from 'domains/reporting/services/ticketFieldsReportingService'
import { getStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { getSortedAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { getCustomFieldsOrder } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { getFilterDateRange } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import { isAiAgentCustomField } from 'pages/aiAgent/util'

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
