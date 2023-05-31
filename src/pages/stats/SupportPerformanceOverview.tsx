import classnames from 'classnames'
import React, {useMemo, useState} from 'react'
import {Link} from 'react-router-dom'

import {TicketChannel} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import StatsPage from 'pages/stats/StatsPage'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'
import blueStar from 'assets/img/icons/blue-star.svg'
import {getTimezone} from 'state/currentUser/selectors'
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
import {
    periodToReportingGranularity,
    statsFiltersToReportingFilters,
    TicketStateStatsFiltersMembers,
} from 'utils/reporting'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import {
    ReportingFilterOperator,
    TicketStateDimension,
    TicketStateMeasure,
    TicketStateMember,
    TicketStateSegment,
} from 'models/reporting/types'
import {useGetReporting} from 'models/reporting/queries'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'

import BigNumberMetric from './BigNumberMetric'
import DashboardSection from './DashboardSection'
import DashboardGridCell from './DashboardGridCell'
import css from './SupportPerformanceOverview.less'
import ChartCard from './ChartCard'
import TrendMetricCard from './TrendMetricCard'
import GaugeChart from './GaugeChart'
import {OneDimensionalDataItem} from './types'
import TimeSeriesChart from './TimeSeriesChart'

const DEFAULT_TIMEZONE = 'UTC'
const LEARN_MORE_URL =
    'https://docs.gorgias.com/en-US/226700-5b26beb8fd254af181bd50281c5bbde6'

export default function SupportPerformanceOverview() {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const [isVersionBannerVisible, setIsVersionBannerVisible] = useState(true)
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const statsFilters = useAppSelector(getStatsFilters)
    const integrationsStatsFilter = useAppSelector(
        getMessagingIntegrationsStatsFilter
    )

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, agents, period} = statsFilters
        return {
            channels,
            agents,
            period,
            integrations: integrationsStatsFilter,
        }
    }, [integrationsStatsFilter, statsFilters])

    const requestStatsFilters = useCleanStatsFilters(pageStatsFilters)

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

    const workloadPerChannel = useGetReporting<
        {
            [TicketStateMeasure.TicketCount]: string
            [TicketStateDimension.Channel]: TicketChannel
        }[],
        OneDimensionalDataItem[]
    >(
        [
            {
                measures: [TicketStateMeasure.TicketCount],
                order: [[TicketStateMeasure.TicketCount, 'desc']],
                dimensions: [TicketStateDimension.Channel],
                segments: [TicketStateSegment.WorkloadTickets],
                filters: [
                    {
                        member: TicketStateMember.IsSpam,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    {
                        member: TicketStateMember.IsTrashed,
                        operator: ReportingFilterOperator.Equals,
                        values: ['0'],
                    },
                    ...statsFiltersToReportingFilters(
                        TicketStateStatsFiltersMembers,
                        statsFilters
                    ),
                ],
            },
        ],
        {
            select: (data) => {
                return data.data.data.map((item) => ({
                    label: TICKET_CHANNEL_NAMES[
                        item[TicketStateDimension.Channel]
                    ],
                    value: parseFloat(item[TicketStateMeasure.TicketCount]),
                }))
            },
        }
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
                            Welcome to the new Statistics Overview beta! The
                            metrics are computed in a new way to represent your
                            performance more accurately.{' '}
                            <a href={LEARN_MORE_URL}>Learn more.</a>
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
                    </>
                }
            >
                <DashboardSection title="Customer experience">
                    <DashboardGridCell size={3}>
                        <TrendMetricCard
                            title="Customer satisfaction"
                            hint="Average CSAT score for tickets which received a survey during the period"
                            data={customerSatisfactionTrend.data}
                            interpretAs="more-is-better"
                        >
                            {({formattedValue}) => (
                                <BigNumberMetric>
                                    {formattedValue}{' '}
                                    <img
                                        className={css.customerSatisfactionStar}
                                        src={blueStar}
                                        alt="Blue star"
                                    />
                                </BigNumberMetric>
                            )}
                        </TrendMetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={3}>
                        <TrendMetricCard
                            title="First response time"
                            hint="Median time between 1st customer message and 1st human agent response"
                            data={firstResponseTimeTrend.data}
                            interpretAs="less-is-better"
                            valueFormat="duration"
                        >
                            {({formattedValue}) => (
                                <BigNumberMetric>
                                    {formattedValue}
                                </BigNumberMetric>
                            )}
                        </TrendMetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={3}>
                        <TrendMetricCard
                            title="Resolution time"
                            hint="Median time between the 1st customer message and the last time the ticket was closed"
                            data={resolutionTimeTrend.data}
                            valueFormat="duration"
                            interpretAs="less-is-better"
                        >
                            {({formattedValue}) => (
                                <BigNumberMetric>
                                    {formattedValue}
                                </BigNumberMetric>
                            )}
                        </TrendMetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={3}>
                        <TrendMetricCard
                            title="Messages per ticket"
                            hint="Average number of messages exchanged per closed ticket"
                            data={messagesPerTicketTrend.data}
                            interpretAs="less-is-better"
                        >
                            {({formattedValue}) => (
                                <BigNumberMetric>
                                    {formattedValue}
                                </BigNumberMetric>
                            )}
                        </TrendMetricCard>
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Workload">
                    <DashboardGridCell size={6}>
                        <TrendMetricCard
                            title="Open tickets"
                            hint="Number of tickets with the status “open” at the end of the period"
                            data={openTicketsTrend.data}
                            trendFormat="percent"
                        >
                            {({formattedValue, formattedPrevValue}) => (
                                <BigNumberMetric from={formattedPrevValue}>
                                    {formattedValue}
                                </BigNumberMetric>
                            )}
                        </TrendMetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <TrendMetricCard
                            title="Closed tickets"
                            hint="Number of unique tickets closed during the period (and that did not reopen)"
                            data={closedTicketsTrend.data}
                            trendFormat="percent"
                            interpretAs="neutral"
                        >
                            {({formattedValue, formattedPrevValue}) => (
                                <BigNumberMetric from={formattedPrevValue}>
                                    {formattedValue}
                                </BigNumberMetric>
                            )}
                        </TrendMetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <TrendMetricCard
                            title="Tickets created"
                            hint="Number of new tickets to handle"
                            data={ticketsCreatedTrend.data}
                            trendFormat="percent"
                            interpretAs="neutral"
                        >
                            {({formattedValue, formattedPrevValue}) => (
                                <BigNumberMetric from={formattedPrevValue}>
                                    {formattedValue}
                                </BigNumberMetric>
                            )}
                        </TrendMetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <TrendMetricCard
                            title="Tickets replied"
                            hint="Number of tickets where the customer got a response"
                            data={ticketsRepliedTrend.data}
                            trendFormat="percent"
                            interpretAs="more-is-better"
                        >
                            {({formattedValue, formattedPrevValue}) => (
                                <BigNumberMetric from={formattedPrevValue}>
                                    {formattedValue}
                                </BigNumberMetric>
                            )}
                        </TrendMetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <TrendMetricCard
                            title="Messages sent"
                            hint="Number of messages received by your customer"
                            data={messagesSentTrend.data}
                            trendFormat="percent"
                        >
                            {({formattedValue, formattedPrevValue}) => (
                                <BigNumberMetric from={formattedPrevValue}>
                                    {formattedValue}
                                </BigNumberMetric>
                            )}
                        </TrendMetricCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <ChartCard
                            title="Tickets created"
                            hint="Number of new tickets to handle"
                        >
                            <TimeSeriesChart
                                timeSeries={ticketsCreatedTimeSeries}
                                labels={['Tickets created']}
                                granularity={granularity}
                            />
                        </ChartCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <ChartCard
                            title="Closed tickets"
                            hint="Number of opened tickets solved by the end of the period"
                        >
                            <TimeSeriesChart
                                timeSeries={ticketsClosedTimeSeries}
                                labels={['Closed tickets']}
                                granularity={granularity}
                            />
                        </ChartCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <ChartCard
                            title="Tickets replied"
                            hint="Number of tickets where the customer got a response"
                        >
                            <TimeSeriesChart
                                timeSeries={ticketsRepliedTimeSeries}
                                labels={['Tickets replied']}
                                granularity={granularity}
                            />
                        </ChartCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <ChartCard
                            title="Messages sent"
                            hint="Number of messages received by your customer"
                        >
                            <TimeSeriesChart
                                timeSeries={messagesSentTimeSeries}
                                labels={['Messages sent']}
                                granularity={granularity}
                            />
                        </ChartCard>
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <ChartCard
                            title="Total workload by channel"
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
