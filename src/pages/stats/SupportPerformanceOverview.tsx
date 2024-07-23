import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {FeatureFlagKey} from 'config/featureFlags'
import {FilterKey} from 'models/stat/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import TipsToggle from 'pages/stats/TipsToggle'
import {WorkloadPerChannelChart} from 'pages/stats/support-performance/components/WorkloadPerChannelChart'
import {DownloadOverviewData} from 'pages/stats/support-performance/components/DownloadOverviewData'
import {TrendCard} from 'pages/stats/common/components/TrendCard'

import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {ActivateCustomerSatisfactionSurveyTip} from 'pages/stats/ActivateCustomerSatisfactionSurveyTip'

import {
    currentAccountHasFeature,
    getSurveysSettingsJS,
} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'

import useAppSelector from 'hooks/useAppSelector'
import useLocalStorage from 'hooks/useLocalStorage'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'
import {OverviewChartCard} from 'pages/stats/support-performance/components/OverviewChartCard'
import {
    OverviewChartConfig,
    OverviewMetricConfig,
} from 'pages/stats/SupportPerformanceOverviewConfig'
import {SupportPerformanceTip} from 'pages/stats/SupportPerformanceTip'
import {MetricName} from 'services/reporting/constants'
import {OverviewMetric} from 'state/ui/stats/types'
import {useGridSize} from 'hooks/useGridSize'
import DashboardGridCell from './DashboardGridCell'
import DashboardSection from './DashboardSection'
import {TicketsCreatedVsClosedChartCard} from './support-performance/components/TicketsCreatedVsClosedChartCard'

const SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE = 'Support performance overview'
export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'

export default function SupportPerformanceOverview() {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const hasSatisfactionSurveyEnabled = useAppSelector<boolean>(
        currentAccountHasFeature(AccountFeature.SatisfactionSurveys)
    )

    const surveySettings = useAppSelector(getSurveysSettingsJS)
    const hasSatisfactionSurveyEnabledAndConfigured =
        hasSatisfactionSurveyEnabled &&
        (surveySettings?.data.send_survey_for_chat ||
            surveySettings?.data.send_survey_for_email)
    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        STATS_TIPS_VISIBILITY_KEY,
        true
    )

    const getGridCellSize = useGridSize()

    const performanceOverviewChartType = 'bar'

    return (
        <div className="full-width">
            <StatsPage
                title={SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters />
                        <DownloadOverviewData />
                    </>
                }
            >
                {isAnalyticsNewFilters && (
                    <DashboardSection>
                        <DashboardGridCell
                            size={getGridCellSize(12)}
                            className="pb-0"
                        >
                            <FiltersPanel
                                persistentFilters={[FilterKey.Period]}
                                optionalFilters={[
                                    FilterKey.Channels,
                                    FilterKey.Integrations,
                                ]}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
                <DashboardSection
                    title="Customer experience"
                    titleExtra={
                        <TipsToggle
                            isVisible={!!areTipsVisible}
                            onClick={() => setAreTipsVisible(!areTipsVisible)}
                        />
                    }
                >
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.CustomerSatisfaction
                            ]}
                            drillDownMetric={
                                OverviewMetric.CustomerSatisfaction
                            }
                            tip={
                                areTipsVisible &&
                                (hasSatisfactionSurveyEnabledAndConfigured ? (
                                    <SupportPerformanceTip
                                        metric={MetricName.CustomerSatisfaction}
                                        {...OverviewMetricConfig[
                                            OverviewMetric.CustomerSatisfaction
                                        ]}
                                    />
                                ) : (
                                    <ActivateCustomerSatisfactionSurveyTip />
                                ))
                            }
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.MedianFirstResponseTime
                            ]}
                            drillDownMetric={
                                OverviewMetric.MedianFirstResponseTime
                            }
                            tip={
                                areTipsVisible && (
                                    <SupportPerformanceTip
                                        metric={
                                            MetricName.MedianFirstResponseTime
                                        }
                                        {...OverviewMetricConfig[
                                            OverviewMetric
                                                .MedianFirstResponseTime
                                        ]}
                                    />
                                )
                            }
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.MedianResolutionTime
                            ]}
                            drillDownMetric={
                                OverviewMetric.MedianResolutionTime
                            }
                            tip={
                                areTipsVisible && (
                                    <SupportPerformanceTip
                                        {...OverviewMetricConfig[
                                            OverviewMetric.MedianResolutionTime
                                        ]}
                                        metric={MetricName.MedianResolutionTime}
                                    />
                                )
                            }
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.MessagesPerTicket
                            ]}
                            drillDownMetric={OverviewMetric.MessagesPerTicket}
                            tip={
                                areTipsVisible && (
                                    <SupportPerformanceTip
                                        metric={MetricName.MessagesPerTicket}
                                        {...OverviewMetricConfig[
                                            OverviewMetric.MessagesPerTicket
                                        ]}
                                    />
                                )
                            }
                        />
                    </DashboardGridCell>
                </DashboardSection>

                <DashboardSection title="Workload">
                    <>
                        <DashboardGridCell size={getGridCellSize(4)}>
                            <TrendCard
                                {...OverviewMetricConfig[
                                    OverviewMetric.TicketsCreated
                                ]}
                                drillDownMetric={OverviewMetric.TicketsCreated}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(4)}>
                            <TrendCard
                                {...OverviewMetricConfig[
                                    OverviewMetric.TicketsClosed
                                ]}
                                drillDownMetric={OverviewMetric.TicketsClosed}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(4)}>
                            <TrendCard
                                {...OverviewMetricConfig[
                                    OverviewMetric.OpenTickets
                                ]}
                                drillDownMetric={OverviewMetric.OpenTickets}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={12}>
                            <TicketsCreatedVsClosedChartCard />
                        </DashboardGridCell>
                    </>

                    <DashboardGridCell size={12}>
                        <WorkloadPerChannelChart />
                    </DashboardGridCell>
                </DashboardSection>

                <DashboardSection title="Productivity">
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.TicketsReplied
                            ]}
                            drillDownMetric={OverviewMetric.TicketsReplied}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.MessagesSent
                            ]}
                            drillDownMetric={OverviewMetric.MessagesSent}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.TicketHandleTime
                            ]}
                            drillDownMetric={OverviewMetric.TicketHandleTime}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.OneTouchTickets
                            ]}
                            drillDownMetric={OverviewMetric.OneTouchTickets}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <OverviewChartCard
                            {...OverviewChartConfig[
                                OverviewMetric.TicketsReplied
                            ]}
                            chartType={performanceOverviewChartType}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <OverviewChartCard
                            {...OverviewChartConfig[
                                OverviewMetric.MessagesSent
                            ]}
                            chartType={performanceOverviewChartType}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
