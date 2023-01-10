import React, {useMemo} from 'react'

import {TicketChannel} from 'business/types/ticket'
import {
    FIRST_RESPONSE_TIME,
    stats as statsConfig,
    TICKETS_CREATED_PER_HOUR_PER_WEEKDAY,
} from 'config/stats'
import useAppSelector from 'hooks/useAppSelector'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import PerHourPerWeekTableStat from 'pages/stats/common/components/charts/PerHourPerWeekTableStat'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import StatsPage from 'pages/stats/StatsPage'
import StatWrapper from 'pages/stats/StatWrapper'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import useStatResource from 'pages/stats/useStatResource'
import {StatsFilters, TwoDimensionalChart} from 'models/stat/types'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'

const SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME = 'support-performance-overview'

export default function SupportPerformanceWeeklyTicketLoad() {
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const integrationsStatsFilter = useAppSelector(
        getMessagingIntegrationsStatsFilter
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
            title="Weekly Ticket Load"
            filters={
                pageStatsFilters && (
                    <>
                        <IntegrationsStatsFilter
                            value={pageStatsFilters.integrations}
                            integrations={messagingIntegrations}
                            isMultiple
                        />

                        <ChannelsStatsFilter
                            value={pageStatsFilters.channels}
                            channels={Object.values(TicketChannel)}
                        />

                        <AgentsStatsFilter value={pageStatsFilters.agents} />

                        <TagsStatsFilter value={pageStatsFilters.tags} />

                        <PeriodStatsFilter value={pageStatsFilters.period} />
                    </>
                )
            }
        >
            {pageStatsFilters && (
                <StatWrapper
                    stat={ticketsCreatedPerHourPerWeekday}
                    isFetchingStat={isFetchingTicketsCreatedPerHourPerWeekday}
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
                </StatWrapper>
            )}
        </StatsPage>
    )
}
