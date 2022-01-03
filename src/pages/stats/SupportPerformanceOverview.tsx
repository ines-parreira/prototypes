import React, {ComponentProps, useMemo} from 'react'
import {useSelector} from 'react-redux'

import {
    getMessagingIntegrationsStatsFilter,
    getStatsFiltersJS,
    getStatsMessagingIntegrations,
} from '../../state/stats/selectors'
import {StatsFilterType} from '../../state/stats/types'
import {TicketChannel} from '../../business/types/ticket'
import {OneDimensionalChart, TwoDimensionalChart} from '../../models/stat/types'
import {
    FIRST_RESPONSE_TIME,
    MEDIAN_FIRST_RESPONSE_TIME,
    MEDIAN_RESOLUTION_TIME,
    OVERVIEW,
    RESOLUTION_TIME,
    stats as statsConfig,
    SUPPORT_VOLUME,
    TICKETS_CREATED_PER_HOUR_PER_WEEKDAY,
    TOTAL_MESSAGES_RECEIVED,
    TOTAL_MESSAGES_SENT,
    TOTAL_ONE_TOUCH_TICKETS,
    TOTAL_TICKETS_CLOSED,
    TOTAL_TICKETS_CREATED,
    TOTAL_TICKETS_REPLIED,
} from '../../config/stats'

import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import StatsPage from './StatsPage'
import TagsStatsFilter from './TagsStatsFilter'
import useStatResource from './useStatResource'
import AgentsStatsFilter from './AgentsStatsFilter'
import MultiResourceKeyMetricStat from './common/components/charts/KeyMetricStat/MultiResourceKeyMetricStat'
import TwoDimensionalChartWrapper from './TwoDimensionalStatWrapper'
import {BarStat} from './common/components/charts/BarStat'
import LineStat from './common/components/charts/LineStat'
import PerHourPerWeekTableStat from './common/components/charts/PerHourPerWeekTableStat/PerHourPerWeekTableStat'
import KeyMetricStatWrapper from './KeyMetricStatWrapper'

const SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME = 'support-performance-overview'

export default function SupportPerformanceOverview() {
    const messagingIntegrations = useSelector(getStatsMessagingIntegrations)
    const integrationsStatsFilter = useSelector(
        getMessagingIntegrationsStatsFilter
    )
    const statsFilters = useSelector(getStatsFiltersJS)

    const pageStatsFilters = useMemo(() => {
        return (
            statsFilters && {
                [StatsFilterType.Integrations]: integrationsStatsFilter,
                [StatsFilterType.Channels]:
                    statsFilters[StatsFilterType.Channels] || [],
                [StatsFilterType.Agents]:
                    statsFilters[StatsFilterType.Agents] || [],
                [StatsFilterType.Tags]:
                    statsFilters[StatsFilterType.Tags] || [],
                [StatsFilterType.Period]:
                    statsFilters[StatsFilterType.Period] || [],
            }
        )
    }, [integrationsStatsFilter, statsFilters])

    const [totalTicketsCreated, isFetchingTotalTicketsCreated] =
        useStatResource<OneDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: TOTAL_TICKETS_CREATED,
            statsFilters: pageStatsFilters,
        })

    const [totalTicketsReplied, isFetchingTotalTicketsReplied] =
        useStatResource<OneDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: TOTAL_TICKETS_REPLIED,
            statsFilters: pageStatsFilters,
        })

    const [totalTicketsClosed, isFetchingTotalTicketsClosed] =
        useStatResource<OneDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: TOTAL_TICKETS_CLOSED,
            statsFilters: pageStatsFilters,
        })

    const [totalMessagesSent, isFetchingTotalMessagesSent] =
        useStatResource<OneDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: TOTAL_MESSAGES_SENT,
            statsFilters: pageStatsFilters,
        })

    const [totalMessagesReceived, isFetchingTotalMessagesReceived] =
        useStatResource<OneDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: TOTAL_MESSAGES_RECEIVED,
            statsFilters: pageStatsFilters,
        })

    const [medianFirstResponseTime, isFetchingMedianFirstResponseTime] =
        useStatResource<OneDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: MEDIAN_FIRST_RESPONSE_TIME,
            statsFilters: pageStatsFilters,
        })

    const [medianResolutionTime, isFetchingMedianResolutionTime] =
        useStatResource<OneDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: MEDIAN_RESOLUTION_TIME,
            statsFilters: pageStatsFilters,
        })

    const [totalOneTouchTickets, isFetchingTotalOneTouchTickets] =
        useStatResource<OneDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: TOTAL_ONE_TOUCH_TICKETS,
            statsFilters: pageStatsFilters,
        })

    const overviewResourceStats = useMemo(() => {
        return [
            {
                resourceName: TOTAL_TICKETS_CREATED,
                stat: totalTicketsCreated,
                isFetching: isFetchingTotalTicketsCreated,
            },
            {
                resourceName: TOTAL_TICKETS_REPLIED,
                stat: totalTicketsReplied,
                isFetching: isFetchingTotalTicketsReplied,
            },
            {
                resourceName: TOTAL_TICKETS_CLOSED,
                stat: totalTicketsClosed,
                isFetching: isFetchingTotalTicketsClosed,
            },
            {
                resourceName: TOTAL_MESSAGES_SENT,
                stat: totalMessagesSent,
                isFetching: isFetchingTotalMessagesSent,
            },
            {
                resourceName: TOTAL_MESSAGES_RECEIVED,
                stat: totalMessagesReceived,
                isFetching: isFetchingTotalMessagesReceived,
            },
            {
                resourceName: MEDIAN_FIRST_RESPONSE_TIME,
                stat: medianFirstResponseTime,
                isFetching: isFetchingMedianFirstResponseTime,
            },
            {
                resourceName: MEDIAN_RESOLUTION_TIME,
                stat: medianResolutionTime,
                isFetching: isFetchingMedianResolutionTime,
            },
            {
                resourceName: TOTAL_ONE_TOUCH_TICKETS,
                stat: totalOneTouchTickets,
                isFetching: isFetchingTotalOneTouchTickets,
            },
        ] as ComponentProps<typeof MultiResourceKeyMetricStat>['resourceStats']
    }, [
        totalTicketsCreated,
        isFetchingTotalTicketsCreated,
        totalTicketsReplied,
        isFetchingTotalTicketsReplied,
        totalTicketsClosed,
        isFetchingTotalTicketsClosed,
        totalMessagesSent,
        isFetchingTotalMessagesSent,
        totalMessagesReceived,
        isFetchingTotalMessagesReceived,
        medianFirstResponseTime,
        isFetchingMedianFirstResponseTime,
        medianResolutionTime,
        isFetchingMedianResolutionTime,
        totalOneTouchTickets,
        isFetchingTotalOneTouchTickets,
    ])

    const [supportVolume, isFetchingSupportVolume] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: SUPPORT_VOLUME,
            statsFilters: pageStatsFilters,
        })

    const [resolutionTime, isFetchingResolutionTime] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: RESOLUTION_TIME,
            statsFilters: pageStatsFilters,
        })

    const [firstResponseTime, isFetchingFirstResponseTime] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
            resourceName: FIRST_RESPONSE_TIME,
            statsFilters: pageStatsFilters,
        })

    const [
        ticketsCreatedPerHourPerWeekday,
        isFetchingTicketsCreatedPerHourPerWeekday,
    ] = useStatResource<TwoDimensionalChart>({
        statName: SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME,
        resourceName: TICKETS_CREATED_PER_HOUR_PER_WEEKDAY,
        statsFilters: pageStatsFilters,
    })

    return (
        <StatsPage
            title="Performance overview"
            description="Get an overview of the most important statistics about your customer service.
Metrics such as volume of tickets, first response time and resolution time are key when it comes to
providing excellent customer support."
            helpUrl="https://docs.gorgias.com/statistics/statistics#overview"
            filters={
                pageStatsFilters && (
                    <>
                        <IntegrationsStatsFilter
                            value={
                                pageStatsFilters[StatsFilterType.Integrations]
                            }
                            integrations={messagingIntegrations}
                            isMultiple
                        />
                        <ChannelsStatsFilter
                            value={pageStatsFilters[StatsFilterType.Channels]}
                            channels={Object.values(TicketChannel)}
                        />
                        <AgentsStatsFilter
                            value={pageStatsFilters[StatsFilterType.Agents]}
                        />
                        <TagsStatsFilter
                            value={pageStatsFilters[StatsFilterType.Tags]}
                        />
                        <PeriodStatsFilter
                            value={pageStatsFilters[StatsFilterType.Period]}
                        />
                    </>
                )
            }
        >
            {pageStatsFilters && (
                <>
                    <KeyMetricStatWrapper>
                        <MultiResourceKeyMetricStat
                            resourceStats={overviewResourceStats}
                            config={statsConfig.get(OVERVIEW)}
                        />
                    </KeyMetricStatWrapper>
                    <TwoDimensionalChartWrapper
                        stat={supportVolume}
                        isFetchingStat={isFetchingSupportVolume}
                        resourceName={SUPPORT_VOLUME}
                        statsFilters={pageStatsFilters}
                        helpText="Number of tickets created, replied by agents and closed per day"
                        isDownloadable
                    >
                        {(stat) => (
                            <BarStat
                                data={stat.getIn(['data', 'data'])}
                                legend={stat.getIn(['data', 'legend'], null)}
                                config={statsConfig.get(SUPPORT_VOLUME)}
                            />
                        )}
                    </TwoDimensionalChartWrapper>
                    <TwoDimensionalChartWrapper
                        stat={resolutionTime}
                        isFetchingStat={isFetchingResolutionTime}
                        resourceName={RESOLUTION_TIME}
                        statsFilters={pageStatsFilters}
                        helpText="Time between the first message from a customer and the moment a ticket with at least one response is closed by an agent or a rule"
                        isDownloadable
                    >
                        {(stat) => (
                            <LineStat
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                legend={stat.getIn(['data', 'legend'], null)}
                                config={statsConfig.get(RESOLUTION_TIME)}
                            />
                        )}
                    </TwoDimensionalChartWrapper>
                    <TwoDimensionalChartWrapper
                        stat={firstResponseTime}
                        isFetchingStat={isFetchingFirstResponseTime}
                        resourceName={FIRST_RESPONSE_TIME}
                        statsFilters={pageStatsFilters}
                        helpText="Time between the first message from a customer and the first response from an agent (messages sent by rules don't count)"
                        isDownloadable
                    >
                        {(stat) => (
                            <LineStat
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                legend={stat.getIn(['data', 'legend'], null)}
                                config={statsConfig.get(FIRST_RESPONSE_TIME)}
                            />
                        )}
                    </TwoDimensionalChartWrapper>
                    <TwoDimensionalChartWrapper
                        stat={ticketsCreatedPerHourPerWeekday}
                        isFetchingStat={
                            isFetchingTicketsCreatedPerHourPerWeekday
                        }
                        resourceName={TICKETS_CREATED_PER_HOUR_PER_WEEKDAY}
                        statsFilters={pageStatsFilters}
                        helpText="Tickets created per hour per day of the week"
                        isDownloadable
                    >
                        {(stat) => (
                            <PerHourPerWeekTableStat
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                config={statsConfig.get(FIRST_RESPONSE_TIME)}
                            />
                        )}
                    </TwoDimensionalChartWrapper>
                </>
            )}
        </StatsPage>
    )
}
