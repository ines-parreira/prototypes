import moment from 'moment'
import React, {useEffect, useMemo, useState} from 'react'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    useAutomateMetricsTimeseriesV2,
    useAutomateMetricsTrendV2,
} from 'hooks/reporting/automate/useAutomationDatasetV2'
import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import {calculateGreyArea} from 'hooks/reporting/automate/utils'
import useAppSelector from 'hooks/useAppSelector'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {isAiAgentCustomField} from 'pages/automate/aiAgent/util'
import {
    AUTOMATED_INTERACTION_TOOLTIP,
    AutomatedInteractionsMetric,
} from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {AiAgentStatsDownloadButton} from 'pages/stats/automate/ai-agent/AiAgentStatsDownloadButton'
import {
    getGreyAreaHint,
    useTimeSeriesFormattedData,
} from 'pages/stats/AutomateOverviewContent'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {SHORT_FORMAT} from 'pages/stats/common/utils'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {PAGE_TITLE_AI_AGENT} from 'pages/stats/self-service/constants'
import StatsPage from 'pages/stats/StatsPage'
import {AgentsPerformanceCardExtra} from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import {AgentsTable} from 'pages/stats/support-performance/agents/AgentsTable'
import {AGENT_PERFORMANCE_SECTION_TITLE} from 'pages/stats/support-performance/agents/SupportPerformanceAgents'
import {
    activeParams,
    CustomFieldSelect,
} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {CustomFieldsTicketCountBreakdownReport} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownReport'
import {TicketDistributionTable} from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable'
import {TicketInsightsFieldTrend} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldTrend'
import {getStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'

export default function AutomateAiAgentStats() {
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)
    const {userTimezone, granularity} = useNewAutomateFilters()
    const [isNoActivityAlertDismissed, setIsNoActivityAlertDismissed] =
        useState(false)

    const {automatedInteractionTrend} = useAutomateMetricsTrendV2(
        {
            ...statsFilters,
            channels: {values: ['email'], operator: LogicalOperatorEnum.ONE_OF},
        },
        userTimezone
    )

    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const getGridCellSize = useGridSize()

    const {data: {data: activeFields = []} = {}} =
        useCustomFieldDefinitions(activeParams)

    const hasAiAgentCustomField = useMemo(
        () => activeFields.some(isAiAgentCustomField),
        [activeFields]
    )

    const greyArea = useMemo(
        () =>
            calculateGreyArea(
                moment(statsFilters.period.start_datetime),
                moment(statsFilters.period.end_datetime)
            ),
        [statsFilters.period.end_datetime, statsFilters.period.start_datetime]
    )

    const timeseries = useAutomateMetricsTimeseriesV2(
        statsFilters,
        userTimezone,
        granularity
    )

    const {automatedInteractionByEventTypesTimeSeriesData} =
        useTimeSeriesFormattedData(timeseries, granularity, greyArea)

    const data = automatedInteractionByEventTypesTimeSeriesData.find(
        (x) => x.label === 'AI Agent'
    )

    const greyAreaChartParam = useMemo(
        () =>
            greyArea
                ? {
                      start: greyArea.from.format(SHORT_FORMAT),
                      end: greyArea.to.format(SHORT_FORMAT),
                  }
                : undefined,
        [greyArea]
    )

    const showNoActivityAlert =
        !automatedInteractionTrend.isFetching &&
        !automatedInteractionTrend.data?.value

    useEffect(() => {
        setIsNoActivityAlertDismissed(false)
    }, [statsFilters.period.end_datetime, statsFilters.period.start_datetime])

    return (
        <StatsPage
            title={PAGE_TITLE_AI_AGENT}
            titleExtra={<AiAgentStatsDownloadButton />}
        >
            {showNoActivityAlert && !isNoActivityAlertDismissed && (
                <div style={{padding: '24px'}}>
                    <Alert
                        type={AlertType.Info}
                        icon
                        onClose={() => setIsNoActivityAlertDismissed(true)}
                    >
                        There is no activity during the selected time period. AI
                        Agent may have been disabled or not set up during this
                        time.
                    </Alert>
                </div>
            )}

            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <FiltersPanelWrapper
                        persistentFilters={[FilterKey.Period]}
                        filterSettingsOverrides={{
                            [FilterKey.Period]: {
                                initialSettings: {
                                    maxSpan: 365,
                                },
                            },
                        }}
                    />
                </DashboardGridCell>
            </DashboardSection>

            <DashboardSection title="Performance">
                <DashboardGridCell size={12}>
                    <ChartCard
                        title={AGENT_PERFORMANCE_SECTION_TITLE}
                        titleExtra={<AgentsPerformanceCardExtra />}
                        noPadding
                    >
                        <AgentsTable />
                    </ChartCard>
                </DashboardGridCell>
            </DashboardSection>

            {hasAiAgentCustomField && (
                <DashboardSection className="pb-0" title="Ticket insights">
                    <CustomFieldSelect filter={isAiAgentCustomField} />
                </DashboardSection>
            )}

            {hasAiAgentCustomField && selectedCustomField.id && (
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(1)}>
                        <TicketDistributionTable
                            selectedCustomField={{
                                id: selectedCustomField.id,
                                label: selectedCustomField.label,
                            }}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(11)}>
                        <TicketInsightsFieldTrend />
                    </DashboardGridCell>
                    <DashboardGridCell>
                        <CustomFieldsTicketCountBreakdownReport />
                    </DashboardGridCell>
                </DashboardSection>
            )}

            <DashboardSection title="Automated tickets">
                <DashboardGridCell size={6}>
                    <AutomatedInteractionsMetric
                        trend={automatedInteractionTrend}
                    />
                </DashboardGridCell>

                {data && (
                    <DashboardGridCell size={12}>
                        <ChartCard
                            title="Automated interactions over time"
                            hint={{title: AUTOMATED_INTERACTION_TOOLTIP}}
                            {...getGreyAreaHint(greyArea)}
                        >
                            <LineChart
                                isCurvedLine={false}
                                yAxisBeginAtZero
                                data={[data]}
                                _displayLegacyTooltip
                                greyArea={greyAreaChartParam}
                            />
                        </ChartCard>
                    </DashboardGridCell>
                )}
            </DashboardSection>

            <AnalyticsFooter />
        </StatsPage>
    )
}
