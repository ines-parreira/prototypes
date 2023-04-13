import React, {useMemo} from 'react'
import {useLocalStorage} from 'react-use'

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
import {ticketsCreatedDataItem} from 'fixtures/chart'
import {
    OpenTicketStateMeasure,
    TicketStateMeasure,
} from 'models/reporting/types'
import {useGetMetricTrend} from 'hooks/reporting/useGetMetricTrend'

import BigNumberMetric from './BigNumberMetric'
import DashboardSection from './DashboardSection'
import DashboardGridCell from './DashboardGridCell'
import MetricTooltip from './MetricTooltip'
import TipsToggle from './TipsToggle'
import css from './SupportPerformanceOverview.less'
import ChartCard from './ChartCard'
import LineChart from './LineChart'
import TrendMetricCard from './TrendMetricCard'
import GaugeChart from './GaugeChart'
import {OneDimensionalDataItem} from './types'

export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'

const workloadPerChannelMock: OneDimensionalDataItem[] = [
    {
        label: 'Chat',
        value: 382,
    },
    {
        label: 'Email',
        value: 43,
    },
    {
        label: 'Instagram DM',
        value: 26,
    },
    {
        label: 'Phone',
        value: 54,
    },
    {
        label: 'Others',
        value: 72,
    },
]

export default function SupportPerformanceOverview() {
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const statsFilters = useAppSelector(getStatsFilters)
    const integrationsStatsFilter = useAppSelector(
        getMessagingIntegrationsStatsFilter
    )
    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        STATS_TIPS_VISIBILITY_KEY,
        true
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

    const customerSatisfactionTrend = useGetMetricTrend(
        TicketStateMeasure.SurveyScore,
        pageStatsFilters
    )
    const firstResponseTimeTrend = useGetMetricTrend(
        TicketStateMeasure.FirstResponseTime,
        pageStatsFilters
    )
    const resolutionTimeTrend = useGetMetricTrend(
        TicketStateMeasure.ResolutionTime,
        pageStatsFilters
    )
    const messagePerTicketTrend = useGetMetricTrend(
        TicketStateMeasure.MessagesAverage,
        pageStatsFilters
    )
    const openTicketsTrend = useGetMetricTrend(
        OpenTicketStateMeasure.TicketCount,
        pageStatsFilters
    )
    const closedTicketsTrend = useGetMetricTrend(
        TicketStateMeasure.TicketCount,
        pageStatsFilters
    )
    const ticketsCreatedTrend = useGetMetricTrend(
        TicketStateMeasure.TicketCount,
        pageStatsFilters
    )
    const ticketsRepliedTrend = useGetMetricTrend(
        TicketStateMeasure.TicketCount,
        pageStatsFilters
    )
    const messagesSentTrend = useGetMetricTrend(
        TicketStateMeasure.TicketCount,
        pageStatsFilters
    )

    return (
        <StatsPage
            title="Overview"
            filters={
                pageStatsFilters && (
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
                            value={pageStatsFilters.period}
                            variant="ghost"
                        />
                    </>
                )
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
                    <TrendMetricCard
                        title="Customer satisfaction"
                        hint="Average CSAT score for tickets which received a survey during the period"
                        data={customerSatisfactionTrend.data}
                        interpretAs="more-is-better"
                        tooltip={
                            areTipsVisible && (
                                <MetricTooltip
                                    type="error"
                                    title="Poor performance: 4.3"
                                >
                                    Tip: you're not often using macros, using
                                    them could help you decrease Resolution
                                    Time.
                                </MetricTooltip>
                            )
                        }
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
                        tooltip={
                            areTipsVisible && (
                                <MetricTooltip
                                    type="neutral"
                                    title="Neutral: 5m"
                                >
                                    Tip: Sending cute animal GIFs can boost the
                                    mood in a conversation
                                </MetricTooltip>
                            )
                        }
                    >
                        {({formattedValue}) => (
                            <BigNumberMetric>{formattedValue}</BigNumberMetric>
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
                        tooltip={
                            areTipsVisible && (
                                <MetricTooltip
                                    type="light-error"
                                    title="Underperforming: 48m"
                                >
                                    Tip: you're not often using macros, using
                                    them could help you decrease Resolution
                                    Time.
                                </MetricTooltip>
                            )
                        }
                    >
                        {({formattedValue}) => (
                            <BigNumberMetric>{formattedValue}</BigNumberMetric>
                        )}
                    </TrendMetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <TrendMetricCard
                        title="Messages per ticket"
                        hint="Average number of messages exchanged per closed ticket"
                        data={messagePerTicketTrend.data}
                        interpretAs="less-is-better"
                        tooltip={
                            areTipsVisible && (
                                <MetricTooltip
                                    type="light-success"
                                    title="Overperforming: 9"
                                >
                                    You're doing great, keep up the good work!
                                </MetricTooltip>
                            )
                        }
                    >
                        {({formattedValue}) => (
                            <BigNumberMetric>{formattedValue}</BigNumberMetric>
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
                        title="Tickets created"
                        hint="Number of new tickets to handle"
                        data={ticketsCreatedTrend.data}
                        trendFormat="percent"
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
                        <LineChart
                            data={[ticketsCreatedDataItem]}
                            hasBackground
                        />
                    </ChartCard>
                </DashboardGridCell>
                <DashboardGridCell size={6}>
                    <ChartCard
                        title="Tickets closed"
                        hint="Number of opened tickets solved by the end of the period"
                    >
                        <LineChart
                            data={[
                                {
                                    ...ticketsCreatedDataItem,
                                    label: 'Tickets closed',
                                },
                            ]}
                            hasBackground
                        />
                    </ChartCard>
                </DashboardGridCell>
                <DashboardGridCell size={6}>
                    <ChartCard
                        title="Tickets replied"
                        hint="Number of tickets where the customer got a response"
                    >
                        <LineChart
                            data={[
                                {
                                    ...ticketsCreatedDataItem,
                                    label: 'Tickets replied',
                                },
                            ]}
                            hasBackground
                        />
                    </ChartCard>
                </DashboardGridCell>
                <DashboardGridCell size={6}>
                    <ChartCard
                        title="Messages sent"
                        hint="Number of messages received by your customer"
                    >
                        <LineChart
                            data={[
                                {
                                    ...ticketsCreatedDataItem,
                                    label: 'Messages sent',
                                },
                            ]}
                            hasBackground
                        />
                    </ChartCard>
                </DashboardGridCell>
                <DashboardGridCell size={12}>
                    <ChartCard
                        title="Workload per channel"
                        hint="Distribution of all tickets of the period (both “open” and “closed”) per channel"
                    >
                        <GaugeChart data={workloadPerChannelMock} />
                    </ChartCard>
                </DashboardGridCell>
            </DashboardSection>
        </StatsPage>
    )
}
