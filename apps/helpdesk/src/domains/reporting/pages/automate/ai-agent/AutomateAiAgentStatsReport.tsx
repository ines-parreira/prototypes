import React, { useEffect, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomateMetricsTrend } from 'domains/reporting/hooks/automate/useAutomationDataset'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AiAgentStatsDownloadButton } from 'domains/reporting/pages/automate/ai-agent/AiAgentStatsDownloadButton'
import AiAgentStatsFilters from 'domains/reporting/pages/automate/ai-agent/AiAgentStatsFilters'
import {
    AutomateAiAgentsChart,
    AutomateAiAgentsReportConfig,
} from 'domains/reporting/pages/automate/ai-agent/AutomateAiAgentsReportConfig'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { PAGE_TITLE_AI_AGENT } from 'domains/reporting/pages/self-service/constants'
import {
    activeParams,
    CustomFieldSelect,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import { getSelectedCustomField } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import { useGridSize } from 'hooks/useGridSize'
import { isAiAgentCustomField } from 'pages/aiAgent/util'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

const NoActivityBanner = ({
    isNoActivityAlertDismissed,
    setIsNoActivityAlertDismissed,
}: {
    isNoActivityAlertDismissed: boolean
    setIsNoActivityAlertDismissed: (dismiss: boolean) => void
}) => {
    return (
        !isNoActivityAlertDismissed && (
            <div style={{ padding: '24px' }}>
                <Alert
                    type={AlertType.Info}
                    icon
                    onClose={() => setIsNoActivityAlertDismissed(true)}
                >
                    There is no activity during the selected time period. AI
                    Agent may have been disabled or not set up during this time.
                </Alert>
            </div>
        )
    )
}

const NoActivityBannerComponent = ({
    aiAgentUserId,
    isNoActivityAlertDismissed,
    setIsNoActivityAlertDismissed,
}: {
    aiAgentUserId: number
    isNoActivityAlertDismissed: boolean
    setIsNoActivityAlertDismissed: (dismiss: boolean) => void
}) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const statsFiltersWithAiAgent = useMemo(
        () => ({
            ...statsFilters,
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [aiAgentUserId],
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

    const showNoActivityAlert =
        !automatedInteractionTrend.isFetching &&
        !automatedInteractionTrend.data?.value

    return (
        showNoActivityAlert &&
        !isNoActivityAlertDismissed && (
            <NoActivityBanner
                isNoActivityAlertDismissed={isNoActivityAlertDismissed}
                setIsNoActivityAlertDismissed={setIsNoActivityAlertDismissed}
            />
        )
    )
}

export default function AutomateAiAgentStatsReport() {
    const { statsFilters } = useAutomateFilters()
    const [isNoActivityAlertDismissed, setIsNoActivityAlertDismissed] =
        useState(false)

    useEffect(() => {
        setIsNoActivityAlertDismissed(false)
    }, [statsFilters.period.end_datetime, statsFilters.period.start_datetime])
    const aiAgentUserId = useAIAgentUserId()

    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const getGridCellSize = useGridSize()

    const { data: { data: activeFields = [] } = {} } =
        useCustomFieldDefinitions(activeParams)

    const hasAiAgentCustomField = useMemo(
        () => activeFields.some(isAiAgentCustomField),
        [activeFields],
    )

    useEffectOnce(() => {
        logEvent(SegmentEvent.StatAiAgentOverviewPageViewed)
    })

    return (
        <AiAgentStatsFilters>
            <StatsPage
                title={PAGE_TITLE_AI_AGENT}
                titleExtra={
                    selectedCustomField.id && (
                        <AiAgentStatsDownloadButton
                            selectedCustomFieldId={selectedCustomField.id}
                        />
                    )
                }
            >
                {aiAgentUserId ? (
                    <NoActivityBannerComponent
                        aiAgentUserId={aiAgentUserId}
                        isNoActivityAlertDismissed={isNoActivityAlertDismissed}
                        setIsNoActivityAlertDismissed={
                            setIsNoActivityAlertDismissed
                        }
                    />
                ) : (
                    <NoActivityBanner
                        isNoActivityAlertDismissed={isNoActivityAlertDismissed}
                        setIsNoActivityAlertDismissed={
                            setIsNoActivityAlertDismissed
                        }
                    />
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
