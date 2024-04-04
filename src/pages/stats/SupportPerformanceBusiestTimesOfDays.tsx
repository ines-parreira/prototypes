import React, {useMemo} from 'react'
import {
    FIRST_RESPONSE_TIME,
    stats as statsConfig,
    TICKETS_CREATED_PER_HOUR_PER_WEEKDAY,
} from 'config/stats'
import useStatResource from 'hooks/reporting/useStatResource'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters, TwoDimensionalChart} from 'models/stat/types'
import PerHourPerWeekTableStat from 'pages/stats/common/components/charts/PerHourPerWeekTableStat'
import StatsPage from 'pages/stats/StatsPage'
import StatWrapper from 'pages/stats/StatWrapper'
import {SupportPerformanceBusiestTimesOfDaysFilters} from 'pages/stats/SupportPerformanceBusiestTimesOfDaysFilters'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
} from 'state/stats/selectors'

const SUPPORT_PERFORMANCE_OVERVIEW_STAT_NAME = 'support-performance-overview'

export default function SupportPerformanceBusiestTimesOfDays() {
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
            title="Busiest times of days"
            titleExtra={<SupportPerformanceBusiestTimesOfDaysFilters />}
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
