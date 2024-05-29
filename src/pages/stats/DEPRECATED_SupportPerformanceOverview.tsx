import React, {ComponentProps, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
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
} from 'config/stats'

import useStatResource from 'hooks/reporting/useStatResource'
import useAppSelector from 'hooks/useAppSelector'
import {
    OneDimensionalChart,
    StatsFilters,
    TwoDimensionalChart,
} from 'models/stat/types'

import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import {DEPRECATED_SupportPerformanceOverviewFilters} from 'pages/stats/DEPRECATED_SupportPerformanceOverviewFilters'
import {NotificationStatus} from 'state/notifications/types'
import {
    getMessagingAndAppIntegrationsStatsFilter,
    getStatsFilters,
} from 'state/stats/selectors'
import {BarStat} from './common/components/charts/BarStat'
import MultiResourceKeyMetricStat from './common/components/charts/KeyMetricStat/MultiResourceKeyMetricStat'
import LineStat from './common/components/charts/LineStat'
import PerHourPerWeekTableStat from './common/components/charts/PerHourPerWeekTableStat/PerHourPerWeekTableStat'
import KeyMetricStatWrapper from './KeyMetricStatWrapper'
import StatsPage from './StatsPage'
import StatWrapper from './StatWrapper'

const SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME = 'support-performance-overview'
const PAGE_TITLE = 'Legacy overview'
const SWITCH_TO_NEW_VERSION = 'Switch To new version'
const BANNER_MESSAGE =
    'Warning: The legacy overview page will be deprecated by the end of June 2024.'

export default function DEPRECATED_SupportPerformanceOverview() {
    const [isVersionBannerVisible, setIsVersionBannerVisible] = useState(true)
    const integrationsStatsFilter = useAppSelector(
        getMessagingAndAppIntegrationsStatsFilter
    )
    const statsFilters = useAppSelector(getStatsFilters)

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
        <div className="full-width">
            {isVersionBannerVisible ? (
                <BannerNotification
                    actionHTML={
                        <Link to="/app/stats/support-performance-overview">
                            <i className="material-icons">refresh</i>{' '}
                            {SWITCH_TO_NEW_VERSION}
                        </Link>
                    }
                    closable
                    dismissible={false}
                    message={BANNER_MESSAGE}
                    onClose={() => setIsVersionBannerVisible(false)}
                    status={NotificationStatus.Warning}
                />
            ) : null}
            <StatsPage
                title={PAGE_TITLE}
                description="Get an overview of the most important statistics about your customer service.
Metrics such as volume of tickets, first response time and resolution time are key when it comes to
providing excellent customer support."
                helpUrl="https://docs.gorgias.com/statistics/statistics#overview"
                titleExtra={<DEPRECATED_SupportPerformanceOverviewFilters />}
            >
                {pageStatsFilters && (
                    <>
                        <KeyMetricStatWrapper>
                            <MultiResourceKeyMetricStat
                                resourceStats={overviewResourceStats}
                                config={statsConfig.get(OVERVIEW)}
                            />
                        </KeyMetricStatWrapper>
                        <StatWrapper
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
                                    legend={stat.getIn(
                                        ['data', 'legend'],
                                        null
                                    )}
                                    config={statsConfig.get(SUPPORT_VOLUME)}
                                />
                            )}
                        </StatWrapper>
                        <StatWrapper
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
                                    legend={stat.getIn(
                                        ['data', 'legend'],
                                        null
                                    )}
                                    config={statsConfig.get(RESOLUTION_TIME)}
                                />
                            )}
                        </StatWrapper>
                        <StatWrapper
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
                                    legend={stat.getIn(
                                        ['data', 'legend'],
                                        null
                                    )}
                                    config={statsConfig.get(
                                        FIRST_RESPONSE_TIME
                                    )}
                                />
                            )}
                        </StatWrapper>
                        <StatWrapper
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
                                    config={statsConfig.get(
                                        FIRST_RESPONSE_TIME
                                    )}
                                />
                            )}
                        </StatWrapper>
                    </>
                )}
            </StatsPage>
        </div>
    )
}
