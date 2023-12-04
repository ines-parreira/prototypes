import React, {useMemo, useState} from 'react'
import {useLocalStorage} from 'react-use'
import {Link} from 'react-router-dom'
import moment from 'moment/moment'

import {SegmentEvent, logEvent} from 'common/segment'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {
    useWorkloadPerChannelDistribution,
    useWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import {ActivateCustomerSatisfactionSurveyTip} from 'pages/stats/ActivateCustomerSatisfactionSurveyTip'
import {SupportPerformanceTip} from 'pages/stats/SupportPerformanceTip'

import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import StatsPage from 'pages/stats/StatsPage'
import {
    currentAccountHasFeature,
    getCurrentAccountCreatedDatetime,
    getSurveysSettingsJS,
} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import {getPageStatsFilters, getStatsFilters} from 'state/stats/selectors'
import blueStar from 'assets/img/icons/blue-star.svg'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useMedianResolutionTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import {
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {
    CUSTOMER_SATISFACTION_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MESSAGES_PER_TICKET_LABEL,
    MESSAGES_SENT_LABEL,
    MetricName,
    OPEN_TICKETS_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
    TOTAL_WORKLOAD_BY_CHANNEL_LABEL,
} from 'services/reporting/constants'
import {DownloadOverviewDataButton} from 'pages/stats/DownloadOverviewDataButton'
import {saveReport} from 'services/reporting/supportPerformanceReportingService'
import {getTimezone} from 'state/currentUser/selectors'
import {OverviewMetric} from 'state/ui/stats/types'
import {getPreviousPeriod, periodToReportingGranularity} from 'utils/reporting'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {overviewMetricConfig} from 'pages/stats/SupportPerformanceOverviewConfig'
import {
    formatMetricValue,
    formatTimeSeriesData,
    SHORT_FORMAT,
} from './common/utils'
import MetricCard from './MetricCard'
import TrendBadge from './TrendBadge'
import BigNumberMetric from './BigNumberMetric'
import DashboardGridCell from './DashboardGridCell'
import TipsToggle from './TipsToggle'
import DashboardSection from './DashboardSection'
import css from './SupportPerformanceOverview.less'
import ChartCard from './ChartCard'
import GaugeChart from './GaugeChart'
import LineChart from './LineChart'

export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'
export const AGENTS_REPORT_RELEASE_DATE = '2023-08-14'
const DEFAULT_TIMEZONE = 'UTC'
export const LEARN_MORE_URL =
    'https://docs.gorgias.com/en-US/226700-5b26beb8fd254af181bd50281c5bbde6'

function getBadgeTooltipForPreviousPeriod(statsFilters: StatsFilters) {
    const period = getPreviousPeriod(statsFilters.period)
    return `Compared to: ${moment(period.start_datetime).format(
        SHORT_FORMAT
    )} - ${moment(period.end_datetime).format(SHORT_FORMAT)}`
}

const NoDataTooltip = () => (
    <IconTooltip icon={'help_outline'} className={css.tooltipIcon}>
        No data available for the selected period.
    </IconTooltip>
)

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
    const statsFilters = useAppSelector(getStatsFilters)
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const requestStatsFilters = useCleanStatsFilters(pageStatsFilters)

    const customerSatisfactionTrend = useCustomerSatisfactionTrend(
        requestStatsFilters,
        userTimezone
    )
    const medianFirstResponseTimeTrend = useMedianFirstResponseTimeTrend(
        requestStatsFilters,
        userTimezone
    )
    const medianResolutionTimeTrend = useMedianResolutionTimeTrend(
        requestStatsFilters,
        userTimezone
    )
    const messagesPerTicketTrend = useMessagesPerTicketTrend(
        requestStatsFilters,
        userTimezone
    )
    const openTicketsTrend = useOpenTicketsTrend(
        requestStatsFilters,
        userTimezone
    )
    const closedTicketsTrend = useClosedTicketsTrend(
        requestStatsFilters,
        userTimezone
    )
    const ticketsCreatedTrend = useTicketsCreatedTrend(
        requestStatsFilters,
        userTimezone
    )
    const ticketsRepliedTrend = useTicketsRepliedTrend(
        requestStatsFilters,
        userTimezone
    )
    const messagesSentTrend = useMessagesSentTrend(
        requestStatsFilters,
        userTimezone
    )

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

    const workloadPerChannel = useWorkloadPerChannelDistribution(
        requestStatsFilters,
        userTimezone
    )

    const workloadPerChannelPrevious =
        useWorkloadPerChannelDistributionForPreviousPeriod(
            requestStatsFilters,
            userTimezone
        )

    const exportableData = useMemo(() => {
        return {
            customerSatisfactionTrend,
            medianFirstResponseTimeTrend,
            medianResolutionTimeTrend,
            messagesPerTicketTrend,
            openTicketsTrend,
            closedTicketsTrend,
            ticketsCreatedTrend,
            ticketsRepliedTrend,
            messagesSentTrend,
            ticketsCreatedTimeSeries,
            ticketsClosedTimeSeries,
            ticketsRepliedTimeSeries,
            messagesSentTimeSeries,
            workloadPerChannel,
            workloadPerChannelPrevious,
        }
    }, [
        closedTicketsTrend,
        customerSatisfactionTrend,
        medianFirstResponseTimeTrend,
        messagesPerTicketTrend,
        messagesSentTimeSeries,
        messagesSentTrend,
        openTicketsTrend,
        medianResolutionTimeTrend,
        ticketsClosedTimeSeries,
        ticketsCreatedTimeSeries,
        ticketsCreatedTrend,
        ticketsRepliedTimeSeries,
        ticketsRepliedTrend,
        workloadPerChannel,
        workloadPerChannelPrevious,
    ])

    const loading = useMemo(() => {
        return Object.values(exportableData).some((metric) => metric.isFetching)
    }, [exportableData])

    const periodComparisonTooltipText =
        getBadgeTooltipForPreviousPeriod(statsFilters)

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
                title="Overview"
                filters={
                    <>
                        <SupportPerformanceFilters />
                        <DownloadOverviewDataButton
                            onClick={async () => {
                                logEvent(SegmentEvent.StatDownloadClicked, {
                                    name: 'all-metrics',
                                })
                                await saveReport(
                                    exportableData,
                                    statsFilters.period
                                )
                            }}
                            disabled={loading}
                        />
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
                        <MetricCard
                            {...overviewMetricConfig[
                                OverviewMetric.CustomerSatisfaction
                            ]}
                            isLoading={customerSatisfactionTrend.isFetching}
                            trendBadge={
                                <TrendBadge
                                    format={'percent'}
                                    interpretAs="more-is-better"
                                    isLoading={!customerSatisfactionTrend.data}
                                    tooltip={periodComparisonTooltipText}
                                    value={
                                        customerSatisfactionTrend.data?.value
                                    }
                                    prevValue={
                                        customerSatisfactionTrend.data
                                            ?.prevValue
                                    }
                                />
                            }
                            tip={
                                areTipsVisible &&
                                (hasSatisfactionSurveyEnabledAndConfigured ? (
                                    <SupportPerformanceTip
                                        metric={MetricName.CustomerSatisfaction}
                                        data={customerSatisfactionTrend.data}
                                    />
                                ) : (
                                    <ActivateCustomerSatisfactionSurveyTip />
                                ))
                            }
                        >
                            <BigNumberMetric
                                isLoading={!customerSatisfactionTrend.data}
                            >
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: CUSTOMER_SATISFACTION_LABEL,
                                        metricName:
                                            OverviewMetric.CustomerSatisfaction,
                                        dateRange: statsFilters.period,
                                    }}
                                >
                                    {formatMetricValue(
                                        customerSatisfactionTrend.data?.value
                                    )}
                                </DrillDownModalTrigger>
                                {!customerSatisfactionTrend.data?.value ? (
                                    <NoDataTooltip />
                                ) : (
                                    <img
                                        className={css.customerSatisfactionStar}
                                        src={blueStar}
                                        alt="Blue star"
                                    />
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={3}>
                        <MetricCard
                            {...overviewMetricConfig[
                                OverviewMetric.MedianFirstResponseTime
                            ]}
                            isLoading={medianFirstResponseTimeTrend.isFetching}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="less-is-better"
                                    isLoading={
                                        !medianFirstResponseTimeTrend.data
                                    }
                                    tooltip={periodComparisonTooltipText}
                                    value={
                                        medianFirstResponseTimeTrend.data?.value
                                    }
                                    prevValue={
                                        medianFirstResponseTimeTrend.data
                                            ?.prevValue
                                    }
                                />
                            }
                            tip={
                                areTipsVisible && (
                                    <SupportPerformanceTip
                                        metric={
                                            MetricName.MedianFirstResponseTime
                                        }
                                        data={medianFirstResponseTimeTrend.data}
                                    />
                                )
                            }
                        >
                            <BigNumberMetric
                                isLoading={!medianFirstResponseTimeTrend.data}
                            >
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: MEDIAN_FIRST_RESPONSE_TIME_LABEL,
                                        metricName:
                                            OverviewMetric.MedianFirstResponseTime,
                                        dateRange: statsFilters.period,
                                    }}
                                >
                                    {formatMetricValue(
                                        medianFirstResponseTimeTrend.data
                                            ?.value,
                                        'duration'
                                    )}
                                </DrillDownModalTrigger>

                                {!medianFirstResponseTimeTrend.data?.value && (
                                    <NoDataTooltip />
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={3}>
                        <MetricCard
                            {...overviewMetricConfig[
                                OverviewMetric.MedianResolutionTime
                            ]}
                            isLoading={medianResolutionTimeTrend.isFetching}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="less-is-better"
                                    isLoading={!medianResolutionTimeTrend.data}
                                    tooltip={periodComparisonTooltipText}
                                    value={
                                        medianResolutionTimeTrend.data?.value
                                    }
                                    prevValue={
                                        medianResolutionTimeTrend.data
                                            ?.prevValue
                                    }
                                />
                            }
                            tip={
                                areTipsVisible && (
                                    <SupportPerformanceTip
                                        metric={MetricName.MedianResolutionTime}
                                        data={medianResolutionTimeTrend.data}
                                    />
                                )
                            }
                        >
                            <BigNumberMetric
                                isLoading={!medianResolutionTimeTrend.data}
                            >
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: MEDIAN_RESOLUTION_TIME_LABEL,
                                        metricName:
                                            OverviewMetric.MedianResolutionTime,
                                        dateRange: statsFilters.period,
                                    }}
                                >
                                    {formatMetricValue(
                                        medianResolutionTimeTrend.data?.value,
                                        'duration'
                                    )}
                                </DrillDownModalTrigger>

                                {!medianResolutionTimeTrend.data?.value && (
                                    <NoDataTooltip />
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={3}>
                        <MetricCard
                            {...overviewMetricConfig[
                                OverviewMetric.MessagesPerTicket
                            ]}
                            isLoading={messagesPerTicketTrend.isFetching}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="less-is-better"
                                    isLoading={!messagesPerTicketTrend.data}
                                    tooltip={periodComparisonTooltipText}
                                    value={messagesPerTicketTrend.data?.value}
                                    prevValue={
                                        messagesPerTicketTrend.data?.prevValue
                                    }
                                />
                            }
                            tip={
                                areTipsVisible && (
                                    <SupportPerformanceTip
                                        metric={MetricName.MessagesPerTicket}
                                        data={messagesPerTicketTrend.data}
                                    />
                                )
                            }
                        >
                            <BigNumberMetric
                                isLoading={!messagesPerTicketTrend.data}
                            >
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: MESSAGES_PER_TICKET_LABEL,
                                        metricName:
                                            OverviewMetric.MessagesPerTicket,
                                        dateRange: statsFilters.period,
                                    }}
                                >
                                    {formatMetricValue(
                                        messagesPerTicketTrend.data?.value
                                    )}
                                </DrillDownModalTrigger>
                                {!messagesPerTicketTrend.data?.value && (
                                    <NoDataTooltip />
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Workload">
                    <DashboardGridCell size={6}>
                        <MetricCard
                            {...overviewMetricConfig[
                                OverviewMetric.OpenTickets
                            ]}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="neutral"
                                    isLoading={!openTicketsTrend.data}
                                    prevValue={openTicketsTrend.data?.prevValue}
                                    tooltip={periodComparisonTooltipText}
                                    value={openTicketsTrend.data?.value}
                                />
                            }
                        >
                            <BigNumberMetric
                                isLoading={!openTicketsTrend.data}
                                from={formatMetricValue(
                                    openTicketsTrend.data?.prevValue
                                )}
                            >
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: OPEN_TICKETS_LABEL,
                                        metricName: OverviewMetric.OpenTickets,
                                        dateRange: statsFilters.period,
                                    }}
                                >
                                    {formatMetricValue(
                                        openTicketsTrend.data?.value
                                    )}
                                </DrillDownModalTrigger>

                                {!openTicketsTrend.data?.value && (
                                    <NoDataTooltip />
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <MetricCard
                            {...overviewMetricConfig[
                                OverviewMetric.TicketsClosed
                            ]}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="neutral"
                                    isLoading={!closedTicketsTrend.data}
                                    prevValue={
                                        closedTicketsTrend.data?.prevValue
                                    }
                                    tooltip={periodComparisonTooltipText}
                                    value={closedTicketsTrend.data?.value}
                                />
                            }
                        >
                            <BigNumberMetric
                                isLoading={!closedTicketsTrend.data}
                                from={formatMetricValue(
                                    closedTicketsTrend.data?.prevValue
                                )}
                            >
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: TICKETS_CLOSED_LABEL,
                                        metricName:
                                            OverviewMetric.TicketsClosed,
                                        dateRange: statsFilters.period,
                                    }}
                                >
                                    {formatMetricValue(
                                        closedTicketsTrend.data?.value
                                    )}
                                </DrillDownModalTrigger>

                                {!closedTicketsTrend.data?.value && (
                                    <NoDataTooltip />
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <MetricCard
                            {...overviewMetricConfig[
                                OverviewMetric.TicketsCreated
                            ]}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="neutral"
                                    isLoading={!ticketsCreatedTrend.data}
                                    prevValue={
                                        ticketsCreatedTrend.data?.prevValue
                                    }
                                    tooltip={periodComparisonTooltipText}
                                    value={ticketsCreatedTrend.data?.value}
                                />
                            }
                        >
                            <BigNumberMetric
                                isLoading={!ticketsCreatedTrend.data}
                                from={formatMetricValue(
                                    ticketsCreatedTrend.data?.prevValue
                                )}
                            >
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: TICKETS_CREATED_LABEL,
                                        metricName:
                                            OverviewMetric.TicketsCreated,
                                        dateRange: statsFilters.period,
                                    }}
                                >
                                    {formatMetricValue(
                                        ticketsCreatedTrend.data?.value
                                    )}
                                </DrillDownModalTrigger>

                                {!ticketsCreatedTrend.data?.value && (
                                    <NoDataTooltip />
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <MetricCard
                            {...overviewMetricConfig[
                                OverviewMetric.TicketsReplied
                            ]}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="neutral"
                                    isLoading={!ticketsRepliedTrend.data}
                                    prevValue={
                                        ticketsRepliedTrend.data?.prevValue
                                    }
                                    tooltip={periodComparisonTooltipText}
                                    value={ticketsRepliedTrend.data?.value}
                                />
                            }
                        >
                            <BigNumberMetric
                                isLoading={!ticketsRepliedTrend.data}
                                from={formatMetricValue(
                                    ticketsRepliedTrend.data?.prevValue
                                )}
                            >
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: TICKETS_REPLIED_LABEL,
                                        metricName:
                                            OverviewMetric.TicketsReplied,
                                        dateRange: statsFilters.period,
                                    }}
                                >
                                    {formatMetricValue(
                                        ticketsRepliedTrend.data?.value
                                    )}
                                </DrillDownModalTrigger>

                                {!ticketsRepliedTrend.data?.value && (
                                    <NoDataTooltip />
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <MetricCard
                            {...overviewMetricConfig[
                                OverviewMetric.MessagesSent
                            ]}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="neutral"
                                    isLoading={!messagesSentTrend.data}
                                    prevValue={
                                        messagesSentTrend.data?.prevValue
                                    }
                                    tooltip={periodComparisonTooltipText}
                                    value={messagesSentTrend.data?.value}
                                />
                            }
                        >
                            <BigNumberMetric
                                isLoading={!messagesSentTrend.data}
                                from={formatMetricValue(
                                    messagesSentTrend.data?.prevValue
                                )}
                            >
                                <DrillDownModalTrigger
                                    metricData={{
                                        title: MESSAGES_SENT_LABEL,
                                        metricName: OverviewMetric.MessagesSent,
                                        dateRange: statsFilters.period,
                                    }}
                                >
                                    {formatMetricValue(
                                        messagesSentTrend.data?.value
                                    )}
                                </DrillDownModalTrigger>

                                {!messagesSentTrend.data?.value && (
                                    <NoDataTooltip />
                                )}
                            </BigNumberMetric>
                        </MetricCard>
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
                        <ChartCard
                            title={TOTAL_WORKLOAD_BY_CHANNEL_LABEL}
                            hint="Distribution of all tickets of the period (both “open” and “closed”) by channel"
                        >
                            {workloadPerChannel.data ? (
                                <GaugeChart data={workloadPerChannel.data} />
                            ) : (
                                <Skeleton />
                            )}
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
