import React, {useMemo} from 'react'

import {useSelector} from 'react-redux'

import {
    getMessagingIntegrationsStatsFilter,
    getStatsFiltersJS,
    getStatsMessagingIntegrations,
} from '../../state/stats/selectors'
import {StatsFilterType} from '../../state/stats/types'
import {
    stats as statsConfig,
    TICKETS_CREATED_PER_CHANNEL,
    TICKETS_CREATED_PER_CHANNEL_PER_DAY,
} from '../../config/stats'
import {TwoDimensionalChart} from '../../models/stat/types'
import {TicketChannel} from '../../business/types/ticket'

import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import StatWrapper from './StatWrapper'
import useStatResource from './useStatResource'
import BarStat from './common/components/charts/BarStat'
import TableStat from './common/components/charts/TableStat/TableStat'
import StatsPage from './StatsPage'

const SUPPORT_PERFORMANCE_CHANNELS_STAT_NAME = 'support-performance-channels'

export default function SupportPerformanceChannels() {
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
                [StatsFilterType.Period]:
                    statsFilters[StatsFilterType.Period] || [],
            }
        )
    }, [integrationsStatsFilter, statsFilters])

    const [
        ticketsCreatedPerChannelPerDay,
        isFetchingTicketsCreatedPerChannelPerDay,
    ] = useStatResource<TwoDimensionalChart>({
        statName: SUPPORT_PERFORMANCE_CHANNELS_STAT_NAME,
        resourceName: TICKETS_CREATED_PER_CHANNEL_PER_DAY,
        statsFilters: pageStatsFilters,
    })

    const [ticketsCreatedPerChannel, isFetchingTicketsCreatedPerChannel] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_CHANNELS_STAT_NAME,
            resourceName: TICKETS_CREATED_PER_CHANNEL,
            statsFilters: pageStatsFilters,
        })

    return (
        <StatsPage
            title="Channels"
            description="Channel statistics to get a clear view of your ticket volume based on the different communication
channels such as Facebook Messenger, Instagram Comments, Email, Chat, etc..."
            helpUrl="https://docs.gorgias.com/statistics/statistics#channels"
            filters={
                pageStatsFilters && (
                    <>
                        <IntegrationsStatsFilter
                            value={integrationsStatsFilter}
                            integrations={messagingIntegrations}
                            isMultiple
                        />
                        <ChannelsStatsFilter
                            value={pageStatsFilters[StatsFilterType.Channels]}
                            channels={Object.values(TicketChannel)}
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
                    <StatWrapper
                        stat={ticketsCreatedPerChannelPerDay}
                        isFetchingStat={
                            isFetchingTicketsCreatedPerChannelPerDay
                        }
                        resourceName={TICKETS_CREATED_PER_CHANNEL_PER_DAY}
                        statsFilters={pageStatsFilters}
                        helpText="Number of tickets created per channel per day"
                        isDownloadable
                    >
                        {(stat) => (
                            <BarStat
                                data={stat.getIn(['data', 'data'])}
                                legend={stat.getIn(['data', 'legend'], null)}
                                config={statsConfig.get(
                                    TICKETS_CREATED_PER_CHANNEL_PER_DAY
                                )}
                            />
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={ticketsCreatedPerChannel}
                        isFetchingStat={isFetchingTicketsCreatedPerChannel}
                        resourceName={TICKETS_CREATED_PER_CHANNEL}
                        statsFilters={pageStatsFilters}
                        helpText="Number of tickets created per channel"
                        isDownloadable
                    >
                        {(stat) => (
                            <TableStat
                                context={{tagColors: null}}
                                data={stat.getIn(['data', 'data'])}
                                config={statsConfig.get(
                                    TICKETS_CREATED_PER_CHANNEL
                                )}
                                meta={stat.get('meta')}
                            />
                        )}
                    </StatWrapper>
                </>
            )}
        </StatsPage>
    )
}
