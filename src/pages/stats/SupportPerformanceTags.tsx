import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'
import {fromJS, Map} from 'immutable'

import {
    getMessagingIntegrationsStatsFilter,
    getStatsFiltersJS,
    getStatsMessagingIntegrations,
} from '../../state/stats/selectors'
import {StatsFilterType} from '../../state/stats/types'
import {stats as statsConfig, TICKETS_PER_TAG} from '../../config/stats'
import {getTags} from '../../state/tags/selectors'
import {TwoDimensionalChart} from '../../models/stat/types'
import {TicketChannel} from '../../business/types/ticket'

import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import StatsPage from './StatsPage'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import TagsStatsFilter from './TagsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import useStatResource from './useStatResource'
import TableStat from './common/components/charts/TableStat/TableStat'
import TwoDimensionalChartWrapper from './TwoDimensionalStatWrapper'

const SUPPORT_PERFORMANCE_TAGS_STAT_NAME = 'support-performance-tags'

export default function SupportPerformanceTags() {
    const tags = useSelector(getTags)
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
                [StatsFilterType.Tags]:
                    statsFilters[StatsFilterType.Tags] || [],
                [StatsFilterType.Period]:
                    statsFilters[StatsFilterType.Period] || [],
            }
        )
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
        <StatsPage
            title="Tags"
            description="Tags statistics will show you how many tickets were created during this time period and have a
tag attached to them."
            helpUrl="https://docs.gorgias.com/statistics/statistics#tags"
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
                <TwoDimensionalChartWrapper
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
                </TwoDimensionalChartWrapper>
            )}
        </StatsPage>
    )
}
