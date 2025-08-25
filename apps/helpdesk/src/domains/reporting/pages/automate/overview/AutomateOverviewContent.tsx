import React, { useMemo, useState } from 'react'

import classnames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useLast28daysForAutomateRedirect } from 'domains/reporting/hooks/automate/useLast28daysForAutomateRedirect'
import { FilterKey } from 'domains/reporting/models/stat/types'
import css from 'domains/reporting/pages/automate/overview/AutomateOverview.less'
import { AutomateOverviewDownloadDataButton } from 'domains/reporting/pages/automate/overview/AutomateOverviewDownloadDataButton'
import {
    AutomateOverviewChart,
    AutomateOverviewReportConfig,
} from 'domains/reporting/pages/automate/overview/AutomateOverviewReportConfig'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { PAGE_TITLE_AUTOMATE_PAYWALL } from 'domains/reporting/pages/self-service/constants'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

const BILLING_PIPE_LINE_DATE = 'June 20, 2023'

export default function AutomateOverviewContent() {
    useLast28daysForAutomateRedirect()
    const { statsFilters, userTimezone } = useAutomateFilters()
    const automatedInteractionTrend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone,
    )

    const [noActivityAlert, setNoActivityAlert] = useState(true)
    const [hide72HourAlert, set72HoursAlert] = useState(false)
    const isAutomateOverviewChannelsFilter: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateOverviewChannelsFilter]
    const isTicketTimeToHandleEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.ObservabilityTicketTimeToHandle]
    const isAutomateAIAgentInteractionsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateAIAgentInteractions]

    const isDurationLast3Days = useMemo(() => {
        const startDateTime = moment(statsFilters.period.start_datetime)
        const threeDaysAgo = moment().subtract(3, 'days')
        return startDateTime.isAfter(threeDaysAgo, 'date')
    }, [statsFilters.period.start_datetime])

    const hasActivity =
        !automatedInteractionTrend.isFetching &&
        automatedInteractionTrend.data?.value

    return (
        <div className="full-width">
            <StatsPage
                title={PAGE_TITLE_AUTOMATE_PAYWALL}
                titleExtra={
                    <>
                        <AutomateOverviewDownloadDataButton />
                    </>
                }
            >
                {!hide72HourAlert && (hasActivity || isDurationLast3Days) ? (
                    <div className={classnames(css.wrapper)}>
                        <Alert
                            type={AlertType.Info}
                            icon
                            onClose={() => set72HoursAlert(true)}
                        >
                            Data for the past 72 hours is not included on this
                            dashboard, as interactions are considered automated
                            after 72 hours have passed without a customer reply.
                        </Alert>
                    </div>
                ) : (
                    noActivityAlert &&
                    !automatedInteractionTrend.isFetching &&
                    !automatedInteractionTrend.data?.value && (
                        <div className={classnames(css.wrapper)}>
                            <Alert
                                type={AlertType.Error}
                                icon
                                onClose={() => setNoActivityAlert(false)}
                            >
                                {moment(BILLING_PIPE_LINE_DATE).isAfter(
                                    moment(statsFilters.period.end_datetime),
                                    'day',
                                ) ? (
                                    <span>
                                        There is no available data for this
                                        dashboard before{' '}
                                        <strong>
                                            {BILLING_PIPE_LINE_DATE}
                                        </strong>
                                    </span>
                                ) : (
                                    'There is no activity for these features. Your chat widget or Help Center may not be properly installed.'
                                )}
                            </Alert>
                        </div>
                    )
                )}
                <DashboardSection>
                    <DashboardGridCell size={12}>
                        <FiltersPanelWrapper
                            persistentFilters={
                                AutomateOverviewReportConfig.reportFilters
                                    .persistent
                            }
                            optionalFilters={
                                isAutomateOverviewChannelsFilter
                                    ? [FilterKey.Channels]
                                    : []
                            }
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        maxSpan: 365,
                                    },
                                },
                                // Disable channel filter until fix channels for AI Agent events
                                // [FilterKey.Channels]: {
                                //     channelsFilter:
                                //         AUTOMATE_ENABLED_CHANNELS,
                                // },
                            }}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Performance">
                    <DashboardGridCell size={6}>
                        <DashboardComponent
                            chart={AutomateOverviewChart.AutomationRateKPIChart}
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <DashboardComponent
                            chart={
                                AutomateOverviewChart.AutomatedInteractionsKPIChart
                            }
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <DashboardComponent
                            chart={
                                AutomateOverviewChart.AIAgentAutomationRateKPIChart
                            }
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <DashboardComponent
                            chart={
                                AutomateOverviewChart.AIAgentAutomatedInteractionsKPIChart
                            }
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Impact">
                    <DashboardGridCell size={6}>
                        <DashboardComponent
                            chart={
                                AutomateOverviewChart.AutomationCostSavedKPIChart
                            }
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    {isTicketTimeToHandleEnabled && (
                        <DashboardGridCell size={6}>
                            <DashboardComponent
                                chart={
                                    AutomateOverviewChart.TimeSavedByAgentsKPIChart
                                }
                                config={AutomateOverviewReportConfig}
                            />
                        </DashboardGridCell>
                    )}
                    <DashboardGridCell size={6}>
                        <DashboardComponent
                            chart={
                                AutomateOverviewChart.DecreaseInResolutionTimeGraphChart
                            }
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <DashboardComponent
                            chart={
                                AutomateOverviewChart.AutomationDecreaseInFirstResponseTimeGraphChart
                            }
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Performance over time">
                    <DashboardGridCell size={12}>
                        <DashboardComponent
                            chart={
                                AutomateOverviewChart.AutomationRateGraphChart
                            }
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <DashboardComponent
                            chart={
                                AutomateOverviewChart.AutomatedInteractionsGraphChart
                            }
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <DashboardComponent
                            chart={
                                AutomateOverviewChart.AutomatedInteractionsPerFeatureGraphChart
                            }
                            config={AutomateOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    {isAutomateAIAgentInteractionsEnabled && (
                        <DashboardGridCell size={12}>
                            <DashboardComponent
                                chart={
                                    AutomateOverviewChart.AIAgentAutomatedInteractionsGraphBar
                                }
                                config={AutomateOverviewReportConfig}
                            />
                        </DashboardGridCell>
                    )}
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
