import React, {ComponentProps, useMemo} from 'react'
import {useLocalStorage} from 'react-use'

import {TicketChannel} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import StatsPage from 'pages/stats/StatsPage'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'
import blueStar from 'assets/img/icons/blue-star.svg'
import {ticketsCreatedDataItem} from 'fixtures/chart'

import BigNumberMetric from './BigNumberMetric'
import DashboardSection from './DashboardSection'
import DashboardGridCell from './DashboardGridCell'
import MetricCard from './MetricCard'
import TrendBadge from './TrendBadge'
import MetricTooltip from './MetricTooltip'
import TipsToggle from './TipsToggle'
import css from './SupportPerformanceOverview.less'
import ChartCard from './ChartCard'
import LineChart from './LineChart'

export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'

type MetricMock = {
    value: string
    prevValue?: string
    trendValue: string
    trendDirection: ComponentProps<typeof TrendBadge>['direction']
    trendColor: ComponentProps<typeof TrendBadge>['color']
}

const customerSatisfactionMock: MetricMock = {
    value: '2.24',
    trendValue: '1.2',
    trendDirection: 'up',
    trendColor: 'positive',
}

const firstResponseTimeMock: MetricMock = {
    value: '5m24s',
    trendValue: '21s',
    trendDirection: 'down',
    trendColor: 'positive',
}

const resolutionTimeMock: MetricMock = {
    value: '1h22m',
    trendValue: '2m',
    trendDirection: 'up',
    trendColor: 'negative',
}

const messagesPerTicketMock: MetricMock = {
    value: '6',
    trendValue: '2',
    trendDirection: 'down',
    trendColor: 'positive',
}

const openTicketsMock: MetricMock = {
    value: '112',
    prevValue: '109',
    trendValue: '3%',
    trendDirection: 'up',
    trendColor: 'neutral',
}

const ticketsClosedMock: MetricMock = {
    value: '40',
    prevValue: '38',
    trendValue: '7%',
    trendDirection: 'up',
    trendColor: 'positive',
}

const ticketsCreatedMock: MetricMock = {
    value: '112',
    prevValue: '109',
    trendValue: '3%',
    trendDirection: 'up',
    trendColor: 'neutral',
}

const ticketsRepliedMock: MetricMock = {
    value: '25',
    prevValue: '20',
    trendValue: '20%',
    trendDirection: 'up',
    trendColor: 'positive',
}

const messagesSentMock: MetricMock = {
    value: '25',
    prevValue: '20',
    trendValue: '3%',
    trendDirection: 'up',
    trendColor: 'neutral',
}

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
        const {channels, agents, tags, period} = statsFilters
        return {
            channels,
            agents,
            tags,
            period,
            integrations: integrationsStatsFilter,
        }
    }, [integrationsStatsFilter, statsFilters])

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
                        <TagsStatsFilter
                            value={pageStatsFilters.tags}
                            variant="ghost"
                        />
                        <PeriodStatsFilter
                            value={pageStatsFilters.period}
                            variant="ghost"
                        />

                        <Button
                            className="ml-2"
                            fillStyle="ghost"
                            intent="secondary"
                        >
                            <ButtonIconLabel icon="download">
                                Download Data
                            </ButtonIconLabel>
                        </Button>
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
                    <MetricCard
                        title="Customer satisfaction"
                        hint="Average CSAT score for tickets which received a survey during the period"
                        trendBadge={
                            <TrendBadge
                                direction={
                                    customerSatisfactionMock.trendDirection
                                }
                                color={customerSatisfactionMock.trendColor}
                            >
                                {customerSatisfactionMock.trendValue}
                            </TrendBadge>
                        }
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
                        <BigNumberMetric>
                            {customerSatisfactionMock.value}{' '}
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
                        title="First response time"
                        hint="Median time between 1st customer message and 1st human agent response"
                        trendBadge={
                            <TrendBadge
                                direction={firstResponseTimeMock.trendDirection}
                                color={firstResponseTimeMock.trendColor}
                            >
                                {firstResponseTimeMock.trendValue}
                            </TrendBadge>
                        }
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
                        <BigNumberMetric>
                            {firstResponseTimeMock.value}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <MetricCard
                        title="Resolution time"
                        hint="Median time between the 1st customer message and the last time the ticket was closed"
                        trendBadge={
                            <TrendBadge
                                direction={resolutionTimeMock.trendDirection}
                                color={resolutionTimeMock.trendColor}
                            >
                                {resolutionTimeMock.trendValue}
                            </TrendBadge>
                        }
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
                        <BigNumberMetric>
                            {resolutionTimeMock.value}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={3}>
                    <MetricCard
                        title="Messages per ticket"
                        hint="Average number of messages exchanged per closed ticket"
                        trendBadge={
                            <TrendBadge
                                direction={messagesPerTicketMock.trendDirection}
                                color={messagesPerTicketMock.trendColor}
                            >
                                {messagesPerTicketMock.trendValue}
                            </TrendBadge>
                        }
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
                        <BigNumberMetric>
                            {messagesPerTicketMock.value}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title="Workload">
                <DashboardGridCell size={6}>
                    <MetricCard
                        title="Open tickets"
                        hint="Number of tickets with the status “open” at the end of the period"
                        trendBadge={
                            <TrendBadge
                                direction={openTicketsMock.trendDirection}
                                color={openTicketsMock.trendColor}
                            >
                                {openTicketsMock.trendValue}
                            </TrendBadge>
                        }
                    >
                        <BigNumberMetric from={openTicketsMock.prevValue}>
                            {openTicketsMock.value}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={6}>
                    <MetricCard
                        title="Closed tickets"
                        hint="Number of unique tickets closed during the period (and that did not reopen)"
                        trendBadge={
                            <TrendBadge
                                direction={ticketsClosedMock.trendDirection}
                                color={ticketsClosedMock.trendColor}
                            >
                                {ticketsClosedMock.trendValue}
                            </TrendBadge>
                        }
                    >
                        <BigNumberMetric from={ticketsClosedMock.prevValue}>
                            {ticketsClosedMock.value}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={4}>
                    <MetricCard
                        title="Tickets created"
                        hint="Number of new tickets to handle"
                        trendBadge={
                            <TrendBadge
                                direction={ticketsCreatedMock.trendDirection}
                                color={ticketsCreatedMock.trendColor}
                            >
                                {ticketsCreatedMock.trendValue}
                            </TrendBadge>
                        }
                    >
                        <BigNumberMetric from={ticketsCreatedMock.prevValue}>
                            {ticketsCreatedMock.value}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={4}>
                    <MetricCard
                        title="Tickets replied"
                        hint="Number of tickets where the customer got a response"
                        trendBadge={
                            <TrendBadge
                                direction={ticketsRepliedMock.trendDirection}
                                color={ticketsRepliedMock.trendColor}
                            >
                                {ticketsRepliedMock.trendValue}
                            </TrendBadge>
                        }
                    >
                        <BigNumberMetric from={ticketsRepliedMock.prevValue}>
                            {ticketsRepliedMock.value}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
                <DashboardGridCell size={4}>
                    <MetricCard
                        title="Messages sent"
                        hint="Number of messages received by your customer"
                        trendBadge={
                            <TrendBadge
                                direction={messagesSentMock.trendDirection}
                                color={messagesSentMock.trendColor}
                            >
                                {messagesSentMock.trendValue}
                            </TrendBadge>
                        }
                    >
                        <BigNumberMetric from={messagesSentMock.prevValue}>
                            {messagesSentMock.value}
                        </BigNumberMetric>
                    </MetricCard>
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
            </DashboardSection>
        </StatsPage>
    )
}
