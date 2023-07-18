import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useMemo, useState} from 'react'
import {useLocalStorage} from 'react-use'
import {Link} from 'react-router-dom'
import moment from 'moment/moment'
import {FeatureFlagKey} from 'config/featureFlags'
import {getPreviousPeriod} from 'hooks/reporting/createUseMetricTrend'
import {ActivateCustomerSatisfactionSurveyTip} from 'pages/stats/ActivateCustomerSatisfactionSurveyTip'
import {PerformanceTip} from 'pages/stats/PerformanceTip'

import {TicketChannel} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import StatsPage from 'pages/stats/StatsPage'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'
import blueStar from 'assets/img/icons/blue-star.svg'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useFirstResponseTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useResolutionTimeTrend,
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
import {
    ReportingFilterOperator,
    TicketDimension,
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/types'
import {usePostReporting} from 'models/reporting/queries'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {
    CUSTOMER_SATISFACTION_LABEL,
    FIRST_RESPONSE_TIME_LABEL,
    MESSAGES_PER_TICKET_LABEL,
    MESSAGES_SENT_LABEL,
    MetricName,
    OPEN_TICKETS_LABEL,
    RESOLUTION_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
    TOTAL_WORKLOAD_BY_CHANNEL_LABEL,
} from 'services/reporting/constants'
import {DownloadOverviewDataButton} from 'pages/stats/DownloadOverviewDataButton'
import {saveReport} from 'services/reporting/supportPerformanceReportingService'
import {getTimezone} from 'state/currentUser/selectors'
import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'
import {
    periodToReportingGranularity,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'
import {
    SHORT_FORMAT,
    formatMetricValue,
    formatTimeSeriesData,
} from 'pages/stats/common/utils'
import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'
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
import {OneDimensionalDataItem} from './types'
import TagsStatsFilter from './TagsStatsFilter'

export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'
const DEFAULT_TIMEZONE = 'UTC'
export const LEARN_MORE_URL =
    'https://docs.gorgias.com/en-US/226700-5b26beb8fd254af181bd50281c5bbde6'

function getBadgeTooltipForPreviousPeriod(statsFilters: StatsFilters) {
    const period = getPreviousPeriod(statsFilters.period)
    return `Compared to: ${moment(period.start_datetime).format(
        SHORT_FORMAT
    )} - ${moment(period.end_datetime).format(SHORT_FORMAT)}`
}

export default function SupportPerformanceOverview() {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const [isVersionBannerVisible, setIsVersionBannerVisible] = useState(true)
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const hasPerformanceTips: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsPerformanceTips]
    const hasFilterByTags: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsFilterByTags]
    const hasSatisfactionSurveyEnabled = useAppSelector<boolean>(
        currentAccountHasFeature(AccountFeature.SatisfactionSurveys)
    )
    const statsFilters = useAppSelector(getStatsFilters)
    const integrationsStatsFilter = useAppSelector(
        getMessagingIntegrationsStatsFilter
    )
    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        STATS_TIPS_VISIBILITY_KEY,
        true
    )

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, agents, period, tags} = statsFilters
        return {
            channels,
            agents,
            period,
            integrations: integrationsStatsFilter,
            tags,
        }
    }, [integrationsStatsFilter, statsFilters])

    const requestStatsFilters = useCleanStatsFilters(pageStatsFilters)
    if (!hasFilterByTags) {
        delete requestStatsFilters['tags']
    }

    const customerSatisfactionTrend = useCustomerSatisfactionTrend(
        requestStatsFilters,
        userTimezone
    )
    const firstResponseTimeTrend = useFirstResponseTimeTrend(
        requestStatsFilters,
        userTimezone
    )
    const resolutionTimeTrend = useResolutionTimeTrend(
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

    const workloadPerChannel = usePostReporting<
        {
            [TicketMeasure.TicketCount]: string
            [TicketDimension.FirstMessageChannel]: TicketChannel
        }[],
        OneDimensionalDataItem[]
    >(
        [
            {
                measures: [TicketMeasure.TicketCount],
                order: [[TicketMeasure.TicketCount, 'desc']],
                dimensions: [TicketDimension.FirstMessageChannel],
                segments: [TicketSegment.WorkloadTickets],
                filters: [
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    ...statsFiltersToReportingFilters(
                        TicketStatsFiltersMembers,
                        requestStatsFilters
                    ),
                ],
            },
        ],
        {
            select: (data) => {
                return data.data.data.map((item) => ({
                    label: TICKET_CHANNEL_NAMES[
                        item[TicketDimension.FirstMessageChannel]
                    ],
                    value: parseFloat(item[TicketMeasure.TicketCount]),
                }))
            },
        }
    )

    const workloadPerChannelPrevious = usePostReporting<
        {
            [TicketMeasure.TicketCount]: string
            [TicketDimension.FirstMessageChannel]: TicketChannel
        }[],
        OneDimensionalDataItem[]
    >(
        [
            {
                measures: [TicketMeasure.TicketCount],
                order: [[TicketMeasure.TicketCount, 'desc']],
                dimensions: [TicketDimension.FirstMessageChannel],
                segments: [TicketSegment.WorkloadTickets],
                filters: [
                    {
                        member: TicketMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    ...statsFiltersToReportingFilters(
                        TicketStatsFiltersMembers,
                        {
                            ...requestStatsFilters,
                            period: getPreviousPeriod(
                                requestStatsFilters.period
                            ),
                        }
                    ),
                ],
            },
        ],
        {
            select: (data) => {
                return data.data.data.map((item) => ({
                    label: TICKET_CHANNEL_NAMES[
                        item[TicketDimension.FirstMessageChannel]
                    ],
                    value: parseFloat(item[TicketMeasure.TicketCount]),
                }))
            },
        }
    )

    const exportableData = useMemo(() => {
        return {
            customerSatisfactionTrend,
            firstResponseTimeTrend,
            resolutionTimeTrend,
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
        firstResponseTimeTrend,
        messagesPerTicketTrend,
        messagesSentTimeSeries,
        messagesSentTrend,
        openTicketsTrend,
        resolutionTimeTrend,
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
                        <IntegrationsStatsFilter
                            value={pageStatsFilters.integrations}
                            integrations={messagingIntegrations}
                            isMultiple
                            variant="ghost"
                        />
                        {hasFilterByTags && (
                            <TagsStatsFilter
                                value={pageStatsFilters.tags}
                                variant={'ghost'}
                            />
                        )}
                        <ChannelsStatsFilter
                            value={pageStatsFilters.channels}
                            channels={Object.values(TicketChannel)}
                            variant="ghost"
                        />
                        <AgentsStatsFilter
                            value={pageStatsFilters.agents}
                            variant="ghost"
                        />
                        <PeriodStatsFilter
                            initialSettings={{
                                maxSpan: 365,
                            }}
                            value={pageStatsFilters.period}
                            variant="ghost"
                        />
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
                        hasPerformanceTips && (
                            <TipsToggle
                                isVisible={!!areTipsVisible}
                                onClick={() =>
                                    setAreTipsVisible(!areTipsVisible)
                                }
                            />
                        )
                    }
                >
                    <DashboardGridCell size={3}>
                        <MetricCard
                            title={CUSTOMER_SATISFACTION_LABEL}
                            hint="Average CSAT score for tickets which received a survey during the period"
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
                                hasPerformanceTips &&
                                areTipsVisible &&
                                (hasSatisfactionSurveyEnabled ? (
                                    <PerformanceTip
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
                                {formatMetricValue(
                                    customerSatisfactionTrend.data?.value
                                )}
                                <img
                                    className={css.customerSatisfactionStar}
                                    src={blueStar}
                                    alt="Blue star"
                                />
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={3}>
                        <MetricCard
                            title={FIRST_RESPONSE_TIME_LABEL}
                            hint="Median time between 1st customer message and 1st human agent response"
                            isLoading={firstResponseTimeTrend.isFetching}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="less-is-better"
                                    isLoading={!firstResponseTimeTrend.data}
                                    tooltip={periodComparisonTooltipText}
                                    value={firstResponseTimeTrend.data?.value}
                                    prevValue={
                                        firstResponseTimeTrend.data?.prevValue
                                    }
                                />
                            }
                            tip={
                                hasPerformanceTips &&
                                areTipsVisible && (
                                    <PerformanceTip
                                        metric={MetricName.FirstResponseTime}
                                        data={firstResponseTimeTrend.data}
                                    />
                                )
                            }
                        >
                            <BigNumberMetric
                                isLoading={!firstResponseTimeTrend.data}
                            >
                                {formatMetricValue(
                                    firstResponseTimeTrend.data?.value,
                                    'duration'
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={3}>
                        <MetricCard
                            title={RESOLUTION_TIME_LABEL}
                            hint="Median time between the 1st customer message and the last time the ticket was closed"
                            isLoading={resolutionTimeTrend.isFetching}
                            trendBadge={
                                <TrendBadge
                                    format="percent"
                                    interpretAs="less-is-better"
                                    isLoading={!resolutionTimeTrend.data}
                                    tooltip={periodComparisonTooltipText}
                                    value={resolutionTimeTrend.data?.value}
                                    prevValue={
                                        resolutionTimeTrend.data?.prevValue
                                    }
                                />
                            }
                            tip={
                                hasPerformanceTips &&
                                areTipsVisible && (
                                    <PerformanceTip
                                        metric={MetricName.ResolutionTime}
                                        data={resolutionTimeTrend.data}
                                    />
                                )
                            }
                        >
                            <BigNumberMetric
                                isLoading={!resolutionTimeTrend.data}
                            >
                                {formatMetricValue(
                                    resolutionTimeTrend.data?.value,
                                    'duration'
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={3}>
                        <MetricCard
                            title={MESSAGES_PER_TICKET_LABEL}
                            hint="Average number of messages exchanged per closed ticket"
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
                                hasPerformanceTips &&
                                areTipsVisible && (
                                    <PerformanceTip
                                        metric={MetricName.MessagesPerTicket}
                                        data={messagesPerTicketTrend.data}
                                    />
                                )
                            }
                        >
                            <BigNumberMetric
                                isLoading={!messagesPerTicketTrend.data}
                            >
                                {formatMetricValue(
                                    messagesPerTicketTrend.data?.value
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Workload">
                    <DashboardGridCell size={6}>
                        <MetricCard
                            title={OPEN_TICKETS_LABEL}
                            hint="Number of tickets with the status “open” at the end of the period"
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
                                {formatMetricValue(
                                    openTicketsTrend.data?.value
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <MetricCard
                            title={TICKETS_CLOSED_LABEL}
                            hint="Number of unique tickets closed during the period (and that did not reopen)"
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
                                {formatMetricValue(
                                    closedTicketsTrend.data?.value
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <MetricCard
                            title={TICKETS_CREATED_LABEL}
                            hint="Number of new tickets to handle"
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
                                {formatMetricValue(
                                    ticketsCreatedTrend.data?.value
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <MetricCard
                            title={TICKETS_REPLIED_LABEL}
                            hint="Number of tickets where the customer got a response"
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
                                {formatMetricValue(
                                    ticketsRepliedTrend.data?.value
                                )}
                            </BigNumberMetric>
                        </MetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <MetricCard
                            title={MESSAGES_SENT_LABEL}
                            hint="Number of messages received by your customer"
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
                                {formatMetricValue(
                                    messagesSentTrend.data?.value
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
                {userTimezone && (
                    <div
                        className={classnames(
                            css.pageFooter,
                            'caption-regular'
                        )}
                    >
                        Analytics are using {userTimezone} timezone
                    </div>
                )}
            </StatsPage>
        </div>
    )
}
