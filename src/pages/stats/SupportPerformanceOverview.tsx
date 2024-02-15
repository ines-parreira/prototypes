import {useFlags} from 'launchdarkly-react-client-sdk'
import moment from 'moment/moment'
import React, {useCallback, useState} from 'react'
import {Link} from 'react-router-dom'
import {FeatureFlagKey} from 'config/featureFlags'
import TipsToggle from 'pages/stats/TipsToggle'
import {WorkloadPerChannelChart} from 'pages/stats/support-performance/components/WorkloadPerChannelChart'
import {DownloadOverviewData} from 'pages/stats/support-performance/components/DownloadOverviewData'
import {TrendCard} from 'pages/stats/support-performance/components/TrendCard'

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
import {SCREEN_SIZE, useScreenSize} from 'hooks/useScreenSize'
import DashboardGridCell from './DashboardGridCell'
import DashboardSection from './DashboardSection'
import {TicketsCreatedVsClosedChartCard} from './support-performance/components/TicketsCreatedVsClosedChartCard'

const SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE = 'Support performance overview'
export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'
export const AGENTS_REPORT_RELEASE_DATE = '2023-08-14'
export const LEARN_MORE_URL =
    'https://docs.gorgias.com/en-US/226700-5b26beb8fd254af181bd50281c5bbde6'

export const BANNER_TEXT_DEPRECATED = (
    <>
        Welcome to the new Statistics Overview! Learn more about it{' '}
        <a href={LEARN_MORE_URL}>here</a>.
    </>
)
export const BANNER_TEXT =
    'Starting in July 2024, only this version of the report will be available.The legacy version will be deprecated.'

export default function SupportPerformanceOverview() {
    const accountCreatedDatetime = useAppSelector(
        getCurrentAccountCreatedDatetime
    )
    const [isVersionBannerVisible, setIsVersionBannerVisible] = useState(() =>
        moment(accountCreatedDatetime).isBefore(
            moment(AGENTS_REPORT_RELEASE_DATE)
        )
    )

    const hasSatisfactionSurveyEnabled = useAppSelector<boolean>(
        currentAccountHasFeature(AccountFeature.SatisfactionSurveys)
    )

    const isAnalyticsProductivityMetricsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsProductivityMetrics]

    const surveySettings = useAppSelector(getSurveysSettingsJS)
    const hasSatisfactionSurveyEnabledAndConfigured =
        hasSatisfactionSurveyEnabled &&
        (surveySettings?.data.send_survey_for_chat ||
            surveySettings?.data.send_survey_for_email)
    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        STATS_TIPS_VISIBILITY_KEY,
        true
    )
    const screenSize = useScreenSize()

    const getGridCellSize = useCallback(
        (defaultSize: number) => {
            return screenSize === SCREEN_SIZE.SMALL ? 12 : defaultSize
        },
        [screenSize]
    )

    return (
        <div className="full-width">
            {!isAnalyticsProductivityMetricsEnabled &&
            isVersionBannerVisible ? (
                <BannerNotification
                    actionHTML={
                        <Link to="/app/stats/support-performance-overview-legacy">
                            <i className="material-icons">refresh</i> Switch To
                            Old Version
                        </Link>
                    }
                    closable
                    dismissible={false}
                    message={
                        <span>
                            {isAnalyticsProductivityMetricsEnabled
                                ? BANNER_TEXT
                                : BANNER_TEXT_DEPRECATED}
                        </span>
                    }
                    onClose={() => setIsVersionBannerVisible(false)}
                />
            ) : null}

            <StatsPage
                title={SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE}
                filters={
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
                            overviewMetric={OverviewMetric.CustomerSatisfaction}
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
                            overviewMetric={
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
                            overviewMetric={OverviewMetric.MedianResolutionTime}
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
                            overviewMetric={OverviewMetric.MessagesPerTicket}
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
                    {isAnalyticsProductivityMetricsEnabled ? (
                        <>
                            <DashboardGridCell size={getGridCellSize(3)}>
                                <TrendCard
                                    {...OverviewMetricConfig[
                                        OverviewMetric.TicketsCreated
                                    ]}
                                    overviewMetric={
                                        OverviewMetric.TicketsCreated
                                    }
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={getGridCellSize(3)}>
                                <TrendCard
                                    {...OverviewMetricConfig[
                                        OverviewMetric.TicketsClosed
                                    ]}
                                    overviewMetric={
                                        OverviewMetric.TicketsClosed
                                    }
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={getGridCellSize(3)}>
                                <TrendCard
                                    {...OverviewMetricConfig[
                                        OverviewMetric.OpenTickets
                                    ]}
                                    overviewMetric={OverviewMetric.OpenTickets}
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={12}>
                                <TicketsCreatedVsClosedChartCard />
                            </DashboardGridCell>
                        </>
                    ) : (
                        <>
                            <DashboardGridCell size={getGridCellSize(6)}>
                                <TrendCard
                                    {...OverviewMetricConfig[
                                        OverviewMetric.OpenTickets
                                    ]}
                                    overviewMetric={OverviewMetric.OpenTickets}
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={getGridCellSize(6)}>
                                <TrendCard
                                    {...OverviewMetricConfig[
                                        OverviewMetric.TicketsClosed
                                    ]}
                                    overviewMetric={
                                        OverviewMetric.TicketsClosed
                                    }
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={getGridCellSize(4)}>
                                <TrendCard
                                    {...OverviewMetricConfig[
                                        OverviewMetric.TicketsCreated
                                    ]}
                                    overviewMetric={
                                        OverviewMetric.TicketsCreated
                                    }
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={getGridCellSize(4)}>
                                <TrendCard
                                    {...OverviewMetricConfig[
                                        OverviewMetric.TicketsReplied
                                    ]}
                                    overviewMetric={
                                        OverviewMetric.TicketsReplied
                                    }
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={getGridCellSize(4)}>
                                <TrendCard
                                    {...OverviewMetricConfig[
                                        OverviewMetric.MessagesSent
                                    ]}
                                    overviewMetric={OverviewMetric.MessagesSent}
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={getGridCellSize(6)}>
                                <OverviewChartCard
                                    {...OverviewChartConfig[
                                        OverviewMetric.TicketsCreated
                                    ]}
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={getGridCellSize(6)}>
                                <OverviewChartCard
                                    {...OverviewChartConfig[
                                        OverviewMetric.TicketsClosed
                                    ]}
                                />
                            </DashboardGridCell>
                        </>
                    )}

                    {!isAnalyticsProductivityMetricsEnabled ? (
                        <>
                            <DashboardGridCell size={getGridCellSize(6)}>
                                <OverviewChartCard
                                    {...OverviewChartConfig[
                                        OverviewMetric.TicketsReplied
                                    ]}
                                />
                            </DashboardGridCell>
                            <DashboardGridCell size={getGridCellSize(6)}>
                                <OverviewChartCard
                                    {...OverviewChartConfig[
                                        OverviewMetric.MessagesSent
                                    ]}
                                />
                            </DashboardGridCell>
                        </>
                    ) : null}
                    <DashboardGridCell size={12}>
                        <WorkloadPerChannelChart />
                    </DashboardGridCell>
                </DashboardSection>
                {isAnalyticsProductivityMetricsEnabled ? (
                    <DashboardSection title="Productivity">
                        <DashboardGridCell size={getGridCellSize(3)}>
                            <TrendCard
                                {...OverviewMetricConfig[
                                    OverviewMetric.TicketsReplied
                                ]}
                                overviewMetric={OverviewMetric.TicketsReplied}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(3)}>
                            <TrendCard
                                {...OverviewMetricConfig[
                                    OverviewMetric.MessagesSent
                                ]}
                                overviewMetric={OverviewMetric.MessagesSent}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(3)}>
                            <div></div>
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(3)}>
                            <TrendCard
                                {...OverviewMetricConfig[
                                    OverviewMetric.OneTouchTickets
                                ]}
                                overviewMetric={OverviewMetric.OneTouchTickets}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(6)}>
                            <OverviewChartCard
                                {...OverviewChartConfig[
                                    OverviewMetric.TicketsReplied
                                ]}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(6)}>
                            <OverviewChartCard
                                {...OverviewChartConfig[
                                    OverviewMetric.MessagesSent
                                ]}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                ) : null}
                <AnalyticsFooter />
            </StatsPage>

            {isAnalyticsProductivityMetricsEnabled && isVersionBannerVisible ? (
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
