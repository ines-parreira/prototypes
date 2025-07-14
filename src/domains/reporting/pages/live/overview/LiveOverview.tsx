import React, { useMemo } from 'react'

import moment from 'moment'

import {
    LIVE_OVERVIEW_METRICS,
    OPEN_TICKETS_ASSIGNMENT_STATUSES,
    stats as statsConfig,
    SUPPORT_VOLUME_PER_HOUR,
    USERS_STATUSES,
} from 'domains/reporting/config/stats'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import {
    LegacyStatsFilters,
    OneDimensionalChart,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import MultiResourceKeyMetricStat from 'domains/reporting/pages/common/components/charts/KeyMetricStat/MultiResourceKeyMetricStat'
import LineStat from 'domains/reporting/pages/common/components/charts/LineStat'
import KeyMetricStatWrapper from 'domains/reporting/pages/common/components/KeyMetricStatWrapper'
import StatCurrentDate from 'domains/reporting/pages/common/components/StatCurrentDate'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import StatWrapper from 'domains/reporting/pages/common/layout/StatWrapper'
import css from 'domains/reporting/pages/live/overview/LiveOverview.less'
import { LiveOverviewFilters } from 'domains/reporting/pages/live/overview/LiveOverviewFilters'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import { AccountFeature } from 'state/currentAccount/types'

const LIVE_OVERVIEW_STAT_NAME = 'live-overview'

function LiveOverview() {
    const { cleanStatsFilters, userTimezone } = useAppSelector(
        getCleanStatsFiltersWithTimezone,
    )

    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
        const currentDay = userTimezone ? moment().tz(userTimezone) : moment()
        const { channels, agents } = cleanStatsFilters
        return {
            channels,
            agents,
            period: {
                start_datetime: currentDay.clone().startOf('day').format(),
                end_datetime: currentDay.clone().endOf('day').format(),
            },
        }
    }, [cleanStatsFilters, userTimezone])

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
            helpUrl="https://link.gorgias.com/f0l"
            titleExtra={<LiveOverviewFilters />}
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
                                        SUPPORT_VOLUME_PER_HOUR,
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
    LiveOverview,
)
