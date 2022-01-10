import moment from 'moment'
import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'

import {TicketChannel} from 'business/types/ticket'
import {getTimezone} from 'state/currentUser/selectors'
import {getStatsFiltersJS} from 'state/stats/selectors'
import {PeriodStatsFilterValue, StatsFilterType} from 'state/stats/types'
import {
    stats as statsConfig,
    USERS_STATUSES,
    OPEN_TICKETS_ASSIGNMENT_STATUSES,
    LIVE_OVERVIEW_METRICS,
    SUPPORT_VOLUME_PER_HOUR,
} from 'config/stats'
import {OneDimensionalChart, TwoDimensionalChart} from 'models/stat/types'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'

import AgentsStatsFilter from './AgentsStatsFilter'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import StatsPage from './StatsPage'
import useStatResource from './useStatResource'
import KeyMetricStatWrapper from './KeyMetricStatWrapper'
import MultiResourceKeyMetricStat from './common/components/charts/KeyMetricStat/MultiResourceKeyMetricStat'
import StatWrapper from './StatWrapper'
import LineStat from './common/components/charts/LineStat'
import StatCurrentDate from './common/components/StatCurrentDate'
import css from './LiveOverview.less'

const LIVE_OVERVIEW_STAT_NAME = 'live-overview'

function LiveOverview() {
    const userTimezone = useSelector(getTimezone)
    const statsFilters = useSelector(getStatsFiltersJS)

    const pageStatsFilters = useMemo(() => {
        const currentDay = userTimezone ? moment().tz(userTimezone) : moment()
        return (
            statsFilters && {
                [StatsFilterType.Channels]:
                    statsFilters[StatsFilterType.Channels] || [],
                [StatsFilterType.Agents]:
                    statsFilters[StatsFilterType.Agents] || [],
                [StatsFilterType.Period]: {
                    start_datetime: currentDay.clone().startOf('day').format(),
                    end_datetime: currentDay.clone().endOf('day').format(),
                } as PeriodStatsFilterValue,
            }
        )
    }, [statsFilters, userTimezone])

    const [usersStatuses, isFetchingUsersStatuses] =
        useStatResource<OneDimensionalChart>({
            statName: LIVE_OVERVIEW_STAT_NAME,
            resourceName: USERS_STATUSES,
            statsFilters: pageStatsFilters,
        })

    const [
        openTicketsAssignmentStatuses,
        isFetchingOpenTicketsAssignmentStatuses,
    ] = useStatResource<OneDimensionalChart>({
        statName: LIVE_OVERVIEW_STAT_NAME,
        resourceName: OPEN_TICKETS_ASSIGNMENT_STATUSES,
        statsFilters: pageStatsFilters,
    })

    const overviewResourceStats = useMemo(() => {
        return [
            {
                resourceName: USERS_STATUSES,
                stat: usersStatuses,
                isFetching: isFetchingUsersStatuses,
            },
            {
                resourceName: USERS_STATUSES,
                stat: usersStatuses,
                isFetching: isFetchingUsersStatuses,
            },
            {
                resourceName: OPEN_TICKETS_ASSIGNMENT_STATUSES,
                stat: openTicketsAssignmentStatuses,
                isFetching: isFetchingOpenTicketsAssignmentStatuses,
            },
            {
                resourceName: OPEN_TICKETS_ASSIGNMENT_STATUSES,
                stat: openTicketsAssignmentStatuses,
                isFetching: isFetchingOpenTicketsAssignmentStatuses,
            },
        ]
    }, [
        usersStatuses,
        isFetchingUsersStatuses,
        openTicketsAssignmentStatuses,
        isFetchingOpenTicketsAssignmentStatuses,
    ])

    const [supportVolumePerHour, isFetchingSupportVolumePerHour] =
        useStatResource<TwoDimensionalChart>({
            statName: LIVE_OVERVIEW_STAT_NAME,
            resourceName: SUPPORT_VOLUME_PER_HOUR,
            statsFilters: pageStatsFilters,
        })

    return (
        <StatsPage
            title="Live overview"
            description="Get a live overview of the current activity of your support team, including agent status, open tickets, and volume of tickets you are handling throughout the day."
            helpUrl="https://docs.gorgias.com/statistics/statistics#data_sets"
            filters={
                pageStatsFilters && (
                    <>
                        <ChannelsStatsFilter
                            value={pageStatsFilters[StatsFilterType.Channels]}
                            channels={Object.values(TicketChannel)}
                        />
                        <AgentsStatsFilter
                            value={pageStatsFilters[StatsFilterType.Agents]}
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
                            config={statsConfig.get(LIVE_OVERVIEW_METRICS)}
                        />
                    </KeyMetricStatWrapper>
                    <div className={css.currentDate}>
                        <StatCurrentDate />
                    </div>
                    <StatWrapper
                        helpText="Number of tickets created, replied by agents and closed today per hour"
                        resourceName={SUPPORT_VOLUME_PER_HOUR}
                        statsFilters={pageStatsFilters}
                        stat={supportVolumePerHour}
                        isFetchingStat={isFetchingSupportVolumePerHour}
                    >
                        {(stat) => {
                            return (
                                <LineStat
                                    data={stat.getIn(['data', 'data'])}
                                    meta={stat.get('meta')}
                                    legend={stat.getIn(['data', 'legend'])}
                                    config={statsConfig.get(
                                        SUPPORT_VOLUME_PER_HOUR
                                    )}
                                />
                            )
                        }}
                    </StatWrapper>
                </>
            )}
        </StatsPage>
    )
}

export default withFeaturePaywall(AccountFeature.OverviewLiveStatistics)(
    LiveOverview
)
