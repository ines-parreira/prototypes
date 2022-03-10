import React, {useMemo} from 'react'
import {fromJS, Map} from 'immutable'

import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'
import {stats as statsConfig, TICKETS_PER_TAG} from 'config/stats'
import {getTags} from 'state/tags/selectors'
import {StatsFilters, TwoDimensionalChart} from 'models/stat/types'
import {TicketChannel} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'

import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import StatsPage from './StatsPage'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import TagsStatsFilter from './TagsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import useStatResource from './useStatResource'
import TableStat from './common/components/charts/TableStat/TableStat'
import StatWrapper from './StatWrapper'
import StatsFiltersContext from './StatsFiltersContext'

const SUPPORT_PERFORMANCE_TAGS_STAT_NAME = 'support-performance-tags'

export default function SupportPerformanceTags() {
    const tags = useAppSelector(getTags)
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const integrationsStatsFilter = useAppSelector(
        getMessagingIntegrationsStatsFilter
    )
    const statsFilters = useAppSelector(getStatsFilters)

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, tags, period} = statsFilters
        return {
            channels,
            tags,
            period,
            integrations: integrationsStatsFilter,
        }
    }, [integrationsStatsFilter, statsFilters])

    const [ticketsPerTag, isFetchingTicketsPerTag] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_TAGS_STAT_NAME,
            resourceName: TICKETS_PER_TAG,
            statsFilters: pageStatsFilters,
        })

    const tagColors = useMemo(() => {
        return tags.reduce((tagColors, tag: Map<any, any>) => {
            return tagColors!.set(tag.get('name'), tag.get('decoration'))
        }, fromJS({}) as Map<any, any>)
    }, [tags])

    return (
        <StatsFiltersContext.Provider value={pageStatsFilters}>
            <StatsPage
                title="Tags"
                description="Tags statistics will show you how many tickets were created during this time period and have a
tag attached to them."
                helpUrl="https://docs.gorgias.com/statistics/statistics#tags"
                filters={
                    <>
                        <IntegrationsStatsFilter
                            value={integrationsStatsFilter}
                            integrations={messagingIntegrations}
                            isMultiple
                        />
                        <ChannelsStatsFilter
                            value={pageStatsFilters.channels}
                            channels={Object.values(TicketChannel)}
                        />
                        <TagsStatsFilter value={pageStatsFilters.tags} />
                        <PeriodStatsFilter value={pageStatsFilters.period} />
                    </>
                }
            >
                <StatWrapper
                    stat={ticketsPerTag}
                    isFetchingStat={isFetchingTicketsPerTag}
                    resourceName={TICKETS_PER_TAG}
                    statsFilters={pageStatsFilters}
                    helpText="Number of tickets created per channel"
                    isDownloadable
                >
                    {(stat) => (
                        <TableStat
                            context={{tagColors}}
                            data={stat.getIn(['data', 'data'])}
                            config={statsConfig.get(TICKETS_PER_TAG)}
                            meta={stat.get('meta')}
                        />
                    )}
                </StatWrapper>
            </StatsPage>
        </StatsFiltersContext.Provider>
    )
}
