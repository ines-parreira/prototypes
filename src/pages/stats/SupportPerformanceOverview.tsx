import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import useAppSelector from 'hooks/useAppSelector'
import {useGridSize} from 'hooks/useGridSize'
import useLocalStorage from 'hooks/useLocalStorage'
import {FilterKey} from 'models/stat/types'
import {ActivateCustomerSatisfactionSurveyTip} from 'pages/stats/ActivateCustomerSatisfactionSurveyTip'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {TrendCard} from 'pages/stats/common/components/TrendCard'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {DownloadOverviewData} from 'pages/stats/support-performance/components/DownloadOverviewData'
import {OverviewChartCard} from 'pages/stats/support-performance/components/OverviewChartCard'
import {TicketsCreatedVsClosedChartCard} from 'pages/stats/support-performance/components/TicketsCreatedVsClosedChartCard'
import {WorkloadPerChannelChart} from 'pages/stats/support-performance/components/WorkloadPerChannelChart'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {
    OverviewChartConfig,
    OverviewMetricConfig,
} from 'pages/stats/SupportPerformanceOverviewConfig'
import {SupportPerformanceTip} from 'pages/stats/SupportPerformanceTip'
import TipsToggle from 'pages/stats/TipsToggle'
import {MetricName} from 'services/reporting/constants'
import {
    currentAccountHasFeature,
    getSurveysSettingsJS,
} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import {OverviewMetric} from 'state/ui/stats/types'

const SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE = 'Support performance overview'
export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'
export const PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
]

export default function SupportPerformanceOverview() {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const supportPerformanceOverviewOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS
        )
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
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
                        <DownloadOverviewData
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                        />
                    </>
                }
            >
                {isAnalyticsNewFilters && (
                    <DashboardSection>
                        <DashboardGridCell
                            size={getGridCellSize(12)}
                            className="pb-0"
                        >
                            <FiltersPanelWrapper
                                persistentFilters={[
                                    FilterKey.Period,
                                    FilterKey.AggregationWindow,
                                ]}
                                optionalFilters={[
                                    ...supportPerformanceOverviewOptionalFilters,
                                ]}
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
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
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
                                        isAnalyticsNewFilters={
                                            isAnalyticsNewFilters
                                        }
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
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                            {...OverviewMetricConfig[
                                OverviewMetric.MedianFirstResponseTime
                            ]}
                            drillDownMetric={
                                OverviewMetric.MedianFirstResponseTime
                            }
                            tip={
                                areTipsVisible && (
                                    <SupportPerformanceTip
                                        isAnalyticsNewFilters={
                                            isAnalyticsNewFilters
                                        }
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
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                            {...OverviewMetricConfig[
                                OverviewMetric.MedianResolutionTime
                            ]}
                            drillDownMetric={
                                OverviewMetric.MedianResolutionTime
                            }
                            tip={
                                areTipsVisible && (
                                    <SupportPerformanceTip
                                        isAnalyticsNewFilters={
                                            isAnalyticsNewFilters
                                        }
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
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                            {...OverviewMetricConfig[
                                OverviewMetric.MessagesPerTicket
                            ]}
                            drillDownMetric={OverviewMetric.MessagesPerTicket}
                            tip={
                                areTipsVisible && (
                                    <SupportPerformanceTip
                                        isAnalyticsNewFilters={
                                            isAnalyticsNewFilters
                                        }
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
                                isAnalyticsNewFilters={isAnalyticsNewFilters}
                                {...OverviewMetricConfig[
                                    OverviewMetric.TicketsCreated
                                ]}
                                drillDownMetric={OverviewMetric.TicketsCreated}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(4)}>
                            <TrendCard
                                isAnalyticsNewFilters={isAnalyticsNewFilters}
                                {...OverviewMetricConfig[
                                    OverviewMetric.TicketsClosed
                                ]}
                                drillDownMetric={OverviewMetric.TicketsClosed}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(4)}>
                            <TrendCard
                                isAnalyticsNewFilters={isAnalyticsNewFilters}
                                {...OverviewMetricConfig[
                                    OverviewMetric.OpenTickets
                                ]}
                                drillDownMetric={OverviewMetric.OpenTickets}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={12}>
                            <TicketsCreatedVsClosedChartCard
                                isAnalyticsNewFilters={isAnalyticsNewFilters}
                            />
                        </DashboardGridCell>
                    </>

                    <DashboardGridCell size={12}>
                        <WorkloadPerChannelChart
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                        />
                    </DashboardGridCell>
                </DashboardSection>

                <DashboardSection title="Productivity">
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                            {...OverviewMetricConfig[
                                OverviewMetric.TicketsReplied
                            ]}
                            drillDownMetric={OverviewMetric.TicketsReplied}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                            {...OverviewMetricConfig[
                                OverviewMetric.MessagesSent
                            ]}
                            drillDownMetric={OverviewMetric.MessagesSent}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                            {...OverviewMetricConfig[
                                OverviewMetric.TicketHandleTime
                            ]}
                            drillDownMetric={OverviewMetric.TicketHandleTime}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <TrendCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                            {...OverviewMetricConfig[
                                OverviewMetric.OneTouchTickets
                            ]}
                            drillDownMetric={OverviewMetric.OneTouchTickets}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <OverviewChartCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                            {...OverviewChartConfig[
                                OverviewMetric.TicketsReplied
                            ]}
                            chartType={performanceOverviewChartType}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <OverviewChartCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
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
