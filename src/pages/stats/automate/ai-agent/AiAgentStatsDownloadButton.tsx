import moment from 'moment'
import React, {useMemo} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {useAutomateStatsMeasureLabelMap} from 'hooks/reporting/automate/useAutomateStatsMeasureLabelMap'
import {useAutomateMetricsTimeseriesV2} from 'hooks/reporting/automate/useAutomationDatasetV2'
import {calculateGreyArea} from 'hooks/reporting/automate/utils'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {useAgentsMetrics} from 'hooks/reporting/useAgentsMetrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {getPeriodDateTimes} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {isAiAgentCustomField} from 'pages/automate/aiAgent/util'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {useTimeSeriesFormattedData} from 'pages/stats/AutomateOverviewContent'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {activeParams} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {formatDates} from 'pages/stats/utils'
import {saveReport} from 'services/reporting/automateAiAgentReportingService'
import {getStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {
    getCustomFieldsOrder,
    getSelectedCustomField,
} from 'state/ui/stats/ticketInsightsSlice'
import {getFilterDateRange} from 'utils/reporting'

const DOWNLOAD_BUTTON_TITLE = 'Download AI Agent Data'

export const AiAgentStatsDownloadButton = () => {
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)

    // Get performance data
    const {reportData, isLoading: reportIsLoading} = useAgentsMetrics()
    const {summaryData, isLoading: summaryIsLoading} = useAgentsSummaryMetrics()
    const {columnsOrder} = useAgentsTableConfigSetting()

    const performanceDataIsLoading = reportIsLoading || summaryIsLoading
    const performanceData = {
        data: reportData,
        summary: summaryData,
        columnsOrder,
    }

    // Get automated tickets data
    const automateStatsMeasureLabelMap = useAutomateStatsMeasureLabelMap()
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()

    const timeseries = useAutomateMetricsTimeseriesV2(
        statsFilters,
        userTimezone,
        granularity
    )

    const greyArea = useMemo(
        () =>
            calculateGreyArea(
                moment(statsFilters.period.start_datetime),
                moment(statsFilters.period.end_datetime)
            ),
        [statsFilters.period.end_datetime, statsFilters.period.start_datetime]
    )

    const {exportableData} = useTimeSeriesFormattedData(
        timeseries,
        granularity,
        greyArea
    )

    const automatedInteractionByEventTypesTimeSeries =
        exportableData.automatedInteractionByEventTypesTimeSeries.filter(
            (x) =>
                x[0].label ===
                AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent
        )

    const automatedTicketsDataIsLoading = timeseries.isFetching
    const automatedTicketsData = {
        automateStatsMeasureLabelMap,
        automatedInteractionByEventTypesTimeSeries,
    }

    // Get ticket insights data
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const order = useAppSelector(getCustomFieldsOrder)

    const {data: timeSeriesData, isLoading: ticketInsightsDataIsLoading} =
        useCustomFieldsTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            String(selectedCustomField.id)
        )

    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const hasAiAgentCustomField = useMemo(
        () => activeFields.some(isAiAgentCustomField),
        [activeFields]
    )

    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(cleanStatsFilters.period),
        granularity
    )

    const ticketInsightsData = hasAiAgentCustomField
        ? {
              data: timeSeriesData,
              dateTimes: dateTimes.map((item) =>
                  formatDates(granularity, item)
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
                    statsFilters.period,
                    performanceData,
                    automatedTicketsData,
                    ticketInsightsData
                )
            }}
            isDisabled={
                performanceDataIsLoading ||
                automatedTicketsDataIsLoading ||
                ticketInsightsDataIsLoading
            }
            title={DOWNLOAD_BUTTON_TITLE}
        >
            <ButtonIconLabel icon="file_download">
                {DOWNLOAD_DATA_BUTTON_LABEL}
            </ButtonIconLabel>
        </Button>
    )
}
