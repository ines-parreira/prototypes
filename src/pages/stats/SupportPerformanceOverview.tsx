import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment/moment'
import {WorkloadPerChannelChart} from 'pages/stats/support-performance/components/WorkloadPerChannelChart'
import {OverviewMetricConfig} from 'pages/stats/SupportPerformanceOverviewConfig'
import {DownloadOverviewData} from 'pages/stats/support-performance/components/DownloadOverviewData'
import {TrendCard} from 'pages/stats/support-performance/components/TrendCard'

import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {ActivateCustomerSatisfactionSurveyTip} from 'pages/stats/ActivateCustomerSatisfactionSurveyTip'
import {SupportPerformanceTip} from 'pages/stats/SupportPerformanceTip'

import useAppSelector from 'hooks/useAppSelector'
import useLocalStorage from 'hooks/useLocalStorage'
import StatsPage from 'pages/stats/StatsPage'
import {
    currentAccountHasFeature,
    getCurrentAccountCreatedDatetime,
    getSurveysSettingsJS,
} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import {getPageStatsFilters} from 'state/stats/selectors'
import {
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import {
    MESSAGES_SENT_LABEL,
    MetricName,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
} from 'services/reporting/constants'
import {getTimezone} from 'state/currentUser/selectors'
import {OverviewMetric} from 'state/ui/stats/types'
import {periodToReportingGranularity} from 'utils/reporting'
import {formatTimeSeriesData} from './common/utils'
import DashboardGridCell from './DashboardGridCell'
import TipsToggle from './TipsToggle'
import DashboardSection from './DashboardSection'
import ChartCard from './ChartCard'
import LineChart from './LineChart'
import {DEFAULT_TIMEZONE} from './constants'

const SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE = 'Support performance overview'
export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'
export const AGENTS_REPORT_RELEASE_DATE = '2023-08-14'
export const LEARN_MORE_URL =
    'https://docs.gorgias.com/en-US/226700-5b26beb8fd254af181bd50281c5bbde6'

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
    const surveySettings = useAppSelector(getSurveysSettingsJS)
    const hasSatisfactionSurveyEnabledAndConfigured =
        hasSatisfactionSurveyEnabled &&
        (surveySettings?.data.send_survey_for_chat ||
            surveySettings?.data.send_survey_for_email)
    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        STATS_TIPS_VISIBILITY_KEY,
        true
    )

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const requestStatsFilters = useCleanStatsFilters(pageStatsFilters)

    const granularity = periodToReportingGranularity(requestStatsFilters.period)
    const ticketsCreatedTimeSeries = useTicketsCreatedTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )
    const ticketsClosedTimeSeries = useTicketsClosedTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )
    const ticketsRepliedTimeSeries = useTicketsRepliedTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )
    const messagesSentTimeSeries = useMessagesSentTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )

    return (
        <div className="full-width">
            {isVersionBannerVisible ? (
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
                            Welcome to the new Statistics Overview! Learn more
                            about it <a href={LEARN_MORE_URL}>here</a>.
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
                    <DashboardGridCell size={3}>
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
                    <DashboardGridCell size={3}>
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
                    <DashboardGridCell size={3}>
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
                    <DashboardGridCell size={3}>
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
                    <DashboardGridCell size={6}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.OpenTickets
                            ]}
                            overviewMetric={OverviewMetric.OpenTickets}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.TicketsClosed
                            ]}
                            overviewMetric={OverviewMetric.TicketsClosed}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.TicketsCreated
                            ]}
                            overviewMetric={OverviewMetric.TicketsCreated}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.TicketsReplied
                            ]}
                            overviewMetric={OverviewMetric.TicketsReplied}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <TrendCard
                            {...OverviewMetricConfig[
                                OverviewMetric.MessagesSent
                            ]}
                            overviewMetric={OverviewMetric.MessagesSent}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <ChartCard
                            title={TICKETS_CREATED_LABEL}
                            hint="Number of new tickets to handle"
                        >
                            <LineChart
                                isLoading={!ticketsCreatedTimeSeries.data}
                                data={formatTimeSeriesData(
                                    ticketsCreatedTimeSeries.data,
                                    TICKETS_CREATED_LABEL,
                                    granularity
                                )}
                                hasBackground
                                _displayLegacyTooltip
                            />
                        </ChartCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <ChartCard
                            title={TICKETS_CLOSED_LABEL}
                            hint="Number of opened tickets solved by the end of the period"
                        >
                            <LineChart
                                isLoading={!ticketsClosedTimeSeries.data}
                                data={formatTimeSeriesData(
                                    ticketsClosedTimeSeries.data,
                                    'Closed tickets',
                                    granularity
                                )}
                                hasBackground
                                _displayLegacyTooltip
                            />
                        </ChartCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <ChartCard
                            title={TICKETS_REPLIED_LABEL}
                            hint="Number of tickets where the customer got a response"
                        >
                            <LineChart
                                isLoading={!ticketsRepliedTimeSeries.data}
                                data={formatTimeSeriesData(
                                    ticketsRepliedTimeSeries.data,
                                    TICKETS_REPLIED_LABEL,
                                    granularity
                                )}
                                hasBackground
                                _displayLegacyTooltip
                            />
                        </ChartCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <ChartCard
                            title={MESSAGES_SENT_LABEL}
                            hint="Number of messages received by your customer"
                        >
                            <LineChart
                                isLoading={!messagesSentTimeSeries.data}
                                data={formatTimeSeriesData(
                                    messagesSentTimeSeries.data,
                                    MESSAGES_SENT_LABEL,
                                    granularity
                                )}
                                hasBackground
                                _displayLegacyTooltip
                            />
                        </ChartCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <WorkloadPerChannelChart />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
