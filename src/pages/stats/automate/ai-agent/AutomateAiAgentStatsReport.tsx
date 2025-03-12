import React, { useEffect, useMemo, useState } from 'react'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useAutomateMetricsTrend } from 'hooks/reporting/automate/useAutomationDataset'
import { useNewAutomateFilters } from 'hooks/reporting/automate/useNewAutomateFilters'
import useAppSelector from 'hooks/useAppSelector'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { isAiAgentCustomField } from 'pages/aiAgent/util'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import { AiAgentStatsDownloadButton } from 'pages/stats/automate/ai-agent/AiAgentStatsDownloadButton'
import AiAgentStatsFilters from 'pages/stats/automate/ai-agent/AiAgentStatsFilters'
import {
    AutomateAiAgentsChart,
    AutomateAiAgentsReportConfig,
} from 'pages/stats/automate/ai-agent/AutomateAiAgentsReportConfig'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import { PAGE_TITLE_AI_AGENT } from 'pages/stats/self-service/constants'
import StatsPage from 'pages/stats/StatsPage'
import {
    activeParams,
    CustomFieldSelect,
} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import { getStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { getSelectedCustomField } from 'state/ui/stats/ticketInsightsSlice'

export default function AutomateAiAgentStatsReport() {
    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)
    const { userTimezone } = useNewAutomateFilters()
    const [isNoActivityAlertDismissed, setIsNoActivityAlertDismissed] =
        useState(false)

    const aiAgentUserId = useAIAgentUserId()

    const statsFiltersWithAiAgent = useMemo(
        () => ({
            ...statsFilters,
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [Number(aiAgentUserId)],
            },
        }),
        [aiAgentUserId, statsFilters],
    )

    const { automatedInteractionTrend } = useAutomateMetricsTrend(
        {
            ...statsFiltersWithAiAgent,
            channels: {
                values: ['email'],
                operator: LogicalOperatorEnum.ONE_OF,
            },
        },
        userTimezone,
    )

    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const getGridCellSize = useGridSize()

    const { data: { data: activeFields = [] } = {} } =
        useCustomFieldDefinitions(activeParams)

    const hasAiAgentCustomField = useMemo(
        () => activeFields.some(isAiAgentCustomField),
        [activeFields],
    )

    const showNoActivityAlert =
        !automatedInteractionTrend.isFetching &&
        !automatedInteractionTrend.data?.value

    useEffect(() => {
        setIsNoActivityAlertDismissed(false)
    }, [statsFilters.period.end_datetime, statsFilters.period.start_datetime])

    return (
        <AiAgentStatsFilters>
            <StatsPage
                title={PAGE_TITLE_AI_AGENT}
                titleExtra={<AiAgentStatsDownloadButton />}
            >
                {showNoActivityAlert && !isNoActivityAlertDismissed && (
                    <div style={{ padding: '24px' }}>
                        <Alert
                            type={AlertType.Info}
                            icon
                            onClose={() => setIsNoActivityAlertDismissed(true)}
                        >
                            There is no activity during the selected time
                            period. AI Agent may have been disabled or not set
                            up during this time.
                        </Alert>
                    </div>
                )}

                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            persistentFilters={
                                AutomateAiAgentsReportConfig.reportFilters
                                    .persistent
                            }
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
                        <DashboardComponent
                            config={AutomateAiAgentsReportConfig}
                            chart={AutomateAiAgentsChart.AiAgentTable}
                            withChartMenu={false}
                        />
                    </DashboardGridCell>
                </DashboardSection>

                {hasAiAgentCustomField && (
                    <DashboardSection className="pb-0" title="Ticket insights">
                        <CustomFieldSelect filter={isAiAgentCustomField} />
                    </DashboardSection>
                )}

                {hasAiAgentCustomField && selectedCustomField.id && (
                    <DashboardSection>
                        <DashboardGridCell size={getGridCellSize(4)}>
                            <DashboardComponent
                                config={AutomateAiAgentsReportConfig}
                                chart={
                                    AutomateAiAgentsChart.AiAgentTicketDistribution
                                }
                                withChartMenu={false}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(8)}>
                            <DashboardComponent
                                config={AutomateAiAgentsReportConfig}
                                chart={
                                    AutomateAiAgentsChart.AiAgentTicketInsightsFieldTrend
                                }
                                withChartMenu={false}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell>
                            <DashboardComponent
                                config={AutomateAiAgentsReportConfig}
                                chart={
                                    AutomateAiAgentsChart.AiAgentCustomFieldsTicketCountBreakdown
                                }
                                withChartMenu={false}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}

                <DashboardSection title="Automated tickets">
                    <DashboardGridCell size={6}>
                        <DashboardComponent
                            config={AutomateAiAgentsReportConfig}
                            chart={
                                AutomateAiAgentsChart.AiAgentAutomatedInteractionsMetric
                            }
                            withChartMenu={false}
                        />
                    </DashboardGridCell>

                    <DashboardGridCell size={12}>
                        <DashboardComponent
                            config={AutomateAiAgentsReportConfig}
                            chart={
                                AutomateAiAgentsChart.AiAgentAutomatedInteractionsOverTime
                            }
                            withChartMenu={false}
                        />
                    </DashboardGridCell>
                </DashboardSection>

                <AnalyticsFooter />
            </StatsPage>
        </AiAgentStatsFilters>
    )
}
