import React, {useMemo} from 'react'
import {SupportPerformanceChannelsFilters} from 'pages/stats/SupportPerformanceChannelsFilters'

import {getMessagingAndAppIntegrationsStatsFilter} from 'state/stats/selectors'
import {
    stats as statsConfig,
    TICKETS_CREATED_PER_CHANNEL,
    TICKETS_CREATED_PER_CHANNEL_PER_DAY,
} from 'config/stats'
import {StatsFilters, TwoDimensionalChart} from 'models/stat/types'
import useAppSelector from 'hooks/useAppSelector'

import useStatResource from 'hooks/reporting/useStatResource'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import StatWrapper from './StatWrapper'
import BarStat from './common/components/charts/BarStat'
import TableStat from './common/components/charts/TableStat/TableStat'
import StatsPage from './StatsPage'
import StatsFiltersContext from './StatsFiltersContext'

const SUPPORT_PERFORMANCE_CHANNELS_STAT_NAME = 'support-performance-channels'

export default function SupportPerformanceChannels() {
    const integrationsStatsFilter = useAppSelector(
        getMessagingAndAppIntegrationsStatsFilter
    )
    const {cleanStatsFilters: statsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, period} = statsFilters
        return {
            channels,
            period,
            integrations: integrationsStatsFilter,
        }
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
        <StatsFiltersContext.Provider value={pageStatsFilters}>
            <StatsPage
                title="Channels"
                description="Channel statistics to get a clear view of your ticket volume based on the different communication
channels such as Facebook Messenger, Instagram Comments, Email, Chat, etc..."
                helpUrl="https://docs.gorgias.com/statistics/statistics#channels"
                titleExtra={<SupportPerformanceChannelsFilters />}
            >
                <StatWrapper
                    stat={ticketsCreatedPerChannelPerDay}
                    isFetchingStat={isFetchingTicketsCreatedPerChannelPerDay}
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
            </StatsPage>
        </StatsFiltersContext.Provider>
    )
}
