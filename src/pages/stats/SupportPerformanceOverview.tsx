import moment from 'moment/moment'
import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import {useIsLegacyOverviewDeprecated} from 'hooks/reporting/support-performance/useIsLegacyOverviewDeprecated'
import TipsToggle from 'pages/stats/TipsToggle'
import {WorkloadPerChannelChart} from 'pages/stats/support-performance/components/WorkloadPerChannelChart'
import {DownloadOverviewData} from 'pages/stats/support-performance/components/DownloadOverviewData'
import {TrendCard} from 'pages/stats/common/components/TrendCard'

import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {ActivateCustomerSatisfactionSurveyTip} from 'pages/stats/ActivateCustomerSatisfactionSurveyTip'

import {
    currentAccountHasFeature,
    getCurrentAccountCreatedDatetime,
    getSurveysSettingsJS,
} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'

import useAppSelector from 'hooks/useAppSelector'
import useLocalStorage from 'hooks/useLocalStorage'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
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
export const AGENTS_REPORT_RELEASE_DATE = '2023-08-14'
export const LEARN_MORE_URL =
    'https://docs.gorgias.com/en-US/226700-5b26beb8fd254af181bd50281c5bbde6'

export const BANNER_TEXT =
    'Starting in July 2024, only this version of the report will be available.The legacy version will be deprecated.'

export default function SupportPerformanceOverview() {
    const accountCreatedDatetime = useAppSelector(
        getCurrentAccountCreatedDatetime
    )
    const isLegacyOverviewDeprecated = useIsLegacyOverviewDeprecated()
    const [isVersionBannerVisible, setIsVersionBannerVisible] = useState(
        () =>
            moment(accountCreatedDatetime).isBefore(
                moment(AGENTS_REPORT_RELEASE_DATE)
            ) && !isLegacyOverviewDeprecated
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
                        <SupportPerformanceFilters />
                        <DownloadOverviewData />
                    </>
                }
            >
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

            {isVersionBannerVisible ? (
                <BannerNotification
                    actionHTML={
                        <Link to="/app/stats/support-performance-overview-legacy">
                            <i className="material-icons">refresh</i> Switch To
                            Legacy Version
                        </Link>
                    }
                    closable
                    dismissible={false}
                    message={<span>{BANNER_TEXT}</span>}
                    onClose={() => setIsVersionBannerVisible(false)}
                    borderPosition={'top'}
                />
            ) : null}
        </div>
    )
}
