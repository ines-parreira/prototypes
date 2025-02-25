import React, { useMemo } from 'react'

import moment from 'moment'

import { logEvent, SegmentEvent } from 'common/segment'
import { User } from 'config/types/user'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { AutomateStatsMeasureLabelMap } from 'hooks/reporting/automate/automateStatsMeasureLabelMap'
import { useAutomateMetricsTimeSeries } from 'hooks/reporting/automate/useAutomationDataset'
import { calculateGreyArea } from 'hooks/reporting/automate/utils'
import { useAgentsMetrics } from 'hooks/reporting/support-performance/agents/useAgentsMetrics'
import { useAgentsSummaryMetrics } from 'hooks/reporting/support-performance/agents/useAgentsSummaryMetrics'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { useCustomFieldsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import { useAgentsTableConfigSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import { getPeriodDateTimes } from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { AutomationBillingEventMeasure } from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import { isAiAgentCustomField } from 'pages/aiAgent/util'
import Button from 'pages/common/components/button/Button'
import { getTimeSeriesFormattedData } from 'pages/stats/automate/overview/utils'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'pages/stats/constants'
import { activeParams } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import { formatDates } from 'pages/stats/utils'
import { saveReport } from 'services/reporting/automateAiAgentReportingService'
import { getStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { getSortedAgents } from 'state/ui/stats/agentPerformanceSlice'
import {
    getCustomFieldsOrder,
    getSelectedCustomField,
} from 'state/ui/stats/ticketInsightsSlice'
import { getFilterDateRange } from 'utils/reporting'

const DOWNLOAD_BUTTON_TITLE = 'Download AI Agent Data'

export const AiAgentStatsDownloadButton = () => {
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)

    // Get performance data
    const agents = useAppSelector<User[]>(getSortedAgents)
    const { reportData, isLoading: reportIsLoading } = useAgentsMetrics()
    const { summaryData, isLoading: summaryIsLoading } =
        useAgentsSummaryMetrics()
    const { columnsOrder } = useAgentsTableConfigSetting()

    const performanceDataIsLoading = reportIsLoading || summaryIsLoading
    const performanceData = {
        data: reportData,
        summary: summaryData,
        columnsOrder,
    }

    // Get automated tickets data
    const automateStatsMeasureLabelMap = AutomateStatsMeasureLabelMap
    const { cleanStatsFilters, userTimezone, granularity } =
        useNewStatsFilters()

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
    const automatedTicketsData = {
        automateStatsMeasureLabelMap,
        automatedInteractionByEventTypesTimeSeries,
    }

    // Get ticket insights data
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const order = useAppSelector(getCustomFieldsOrder)

    const { data: timeSeriesData, isLoading: ticketInsightsDataIsLoading } =
        useCustomFieldsTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            String(selectedCustomField.id),
            undefined,
            selectedCustomField.id !== null,
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

    const ticketInsightsData = hasAiAgentCustomField
        ? {
              data: timeSeriesData,
              dateTimes: dateTimes.map((item) =>
                  formatDates(granularity, item),
              ),
              order: order.direction,
          }
        : undefined

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveReport(
                    agents,
                    statsFilters.period,
                    performanceData,
                    automatedTicketsData,
                    ticketInsightsData,
                )
            }}
            isDisabled={
                performanceDataIsLoading ||
                automatedTicketsDataIsLoading ||
                ticketInsightsDataIsLoading
            }
            title={DOWNLOAD_BUTTON_TITLE}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}
