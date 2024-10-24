import {fromJS, Map} from 'immutable'
import React, {useMemo} from 'react'

import {stats as statsConfig, TICKETS_PER_TAG} from 'config/stats'

import useStatResource from 'hooks/reporting/useStatResource'
import useAppSelector from 'hooks/useAppSelector'
import {LegacyStatsFilters, TwoDimensionalChart} from 'models/stat/types'
import {SupportPerformanceTagsFilters} from 'pages/stats/SupportPerformanceTagsFilters'

import {
    getMessagingAndAppIntegrationsStatsFilter,
    getStatsFilters,
} from 'state/stats/selectors'
import {getTags} from 'state/tags/selectors'

import TableStat from './common/components/charts/TableStat/TableStat'
import StatsFiltersContext from './StatsFiltersContext'
import StatsPage from './StatsPage'
import StatWrapper from './StatWrapper'

const SUPPORT_PERFORMANCE_TAGS_STAT_NAME = 'support-performance-tags'

export default function SupportPerformanceTags() {
    const tags = useAppSelector(getTags)
    const integrationsStatsFilter = useAppSelector(
        getMessagingAndAppIntegrationsStatsFilter
    )
    const statsFilters = useAppSelector(getStatsFilters)

    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
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
        return tags.reduce(
            (tagColors, tag) => {
                return tagColors!.set(tag!.get('name'), tag!.get('decoration'))
            },
            fromJS({}) as Map<any, any>
        )
    }, [tags])

    return (
        <StatsFiltersContext.Provider value={pageStatsFilters}>
            <StatsPage
                title="Tags"
                description="Tags statistics will show you how many tickets were created during this time period and have a
tag attached to them."
                helpUrl="https://docs.gorgias.com/statistics/statistics#tags"
                titleExtra={<SupportPerformanceTagsFilters />}
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
