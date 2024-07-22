import React, {useMemo, useCallback} from 'react'
import moment from 'moment-timezone'
import {produce} from 'immer'
import {LiveAgentsFilters} from 'pages/stats/LiveAgentsFilters'

import useAppSelector from 'hooks/useAppSelector'
import {stats as statsConfig, USERS_PERFORMANCE_OVERVIEW} from 'config/stats'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'
import {
    NumericStatAxisValue,
    Stat,
    TwoDimensionalChart,
    StatType,
    NumericStatCell,
    OnlineTimeDetailStatCell,
    TicketDetailStatCell,
    LegacyStatsFilters,
} from 'models/stat/types'
import Navigation from 'pages/common/components/Navigation/Navigation'

import useStatResource from 'hooks/reporting/useStatResource'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import StatsPage from 'pages/stats/StatsPage'
import StatCurrentDate from 'pages/stats/common/components/StatCurrentDate'
import css from 'pages/stats/LiveAgents.less'
import StatWrapper from 'pages/stats/StatWrapper'
import TableStat from 'pages/stats/common/components/charts/TableStat/TableStat'
import StatsFiltersContext from 'pages/stats/StatsFiltersContext'

export type OnlineChoice = 'status_online' | 'time_online'
const LIVE_AGENTS_STAT_NAME = 'live-agents-stat'

function LiveAgents() {
    const {cleanStatsFilters: statsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
        const currentDay = userTimezone ? moment().tz(userTimezone) : moment()
        const {channels, agents} = statsFilters
        return {
            channels,
            agents,
            period: {
                start_datetime: currentDay.clone().startOf('day').format(),
                end_datetime: currentDay.clone().endOf('day').format(),
            },
        }
    }, [statsFilters, userTimezone])

    const [
        userPerformance,
        isFetchingUserPerformance,
        fetchUserPerformancePage,
    ] = useStatResource<
        TwoDimensionalChart<NumericStatAxisValue, NumericStatCell[]>
    >({
        statName: LIVE_AGENTS_STAT_NAME,
        resourceName: USERS_PERFORMANCE_OVERVIEW,
        statsFilters: pageStatsFilters,
    })

    const fetchNextUserPerformancePage = useCallback(() => {
        userPerformance?.meta.next_cursor &&
            fetchUserPerformancePage(userPerformance?.meta.next_cursor)
    }, [fetchUserPerformancePage, userPerformance])

    const fetchPrevUserPerformancePage = useCallback(() => {
        userPerformance?.meta.prev_cursor &&
            fetchUserPerformancePage(userPerformance?.meta.prev_cursor)
    }, [fetchUserPerformancePage, userPerformance])

    const formattedUserPerformance = useMemo(() => {
        return userPerformance && formatUserPerformanceData(userPerformance)
    }, [userPerformance])

    return (
        <StatsFiltersContext.Provider value={pageStatsFilters}>
            <StatsPage
                title="Live agents"
                description="Live Agents will show you the work agents have accomplished over the day."
                helpUrl="https://docs.gorgias.com/statistics/statistics#data_sets"
                titleExtra={<LiveAgentsFilters />}
            >
                {pageStatsFilters && (
                    <>
                        <div className={css.currentDate}>
                            <StatCurrentDate />
                        </div>
                        <StatWrapper
                            resourceName={USERS_PERFORMANCE_OVERVIEW}
                            stat={formattedUserPerformance}
                            isFetchingStat={isFetchingUserPerformance}
                            statsFilters={pageStatsFilters}
                        >
                            {(stat) => (
                                <>
                                    <TableStat
                                        name={LIVE_AGENTS_STAT_NAME}
                                        context={{tagColors: null}}
                                        data={stat.getIn(['data', 'data'])}
                                        meta={stat.get('meta')}
                                        config={statsConfig.get(
                                            USERS_PERFORMANCE_OVERVIEW
                                        )}
                                    />
                                    <div className={css.navigationWrapper}>
                                        <Navigation
                                            hasNextItems={
                                                !!userPerformance?.meta
                                                    .next_cursor
                                            }
                                            hasPrevItems={
                                                !!userPerformance?.meta
                                                    .prev_cursor
                                            }
                                            fetchNextItems={
                                                fetchNextUserPerformancePage
                                            }
                                            fetchPrevItems={
                                                fetchPrevUserPerformancePage
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </StatWrapper>
                    </>
                )}
            </StatsPage>
        </StatsFiltersContext.Provider>
    )
}

const formatUserPerformanceData = (
    stat: Stat<TwoDimensionalChart<NumericStatAxisValue, NumericStatCell[]>>
) => {
    return produce<
        Stat<TwoDimensionalChart<NumericStatAxisValue, NumericStatCell[]>>,
        Stat<
            TwoDimensionalChart<
                NumericStatAxisValue,
                (
                    | NumericStatCell
                    | OnlineTimeDetailStatCell
                    | TicketDetailStatCell
                )[]
            >
        >
    >(stat, (statDraft) => {
        const {
            data: {data},
        } = statDraft
        const {
            axes: {x},
        } = data
        const openTicketsIndex = x.findIndex((x) => x.name === 'Open tickets')
        const ticketsDetailsIndex = x.findIndex(
            (x) => x.name === 'Open tickets per channel'
        )
        const onlineTimeIndex = x.findIndex((x) => x.name === 'Online time')
        const agentTimezoneIndex = x.findIndex(
            (x) => x.name === 'Agent timezone'
        )
        const onlineIndex = x.findIndex((x) => x.name === 'Online')
        const firstSessionIndex = x.findIndex((x) => x.name === 'First Session')
        const lastSessionIndex = x.findIndex((x) => x.name === 'Last Session')

        x[onlineTimeIndex].type = StatType.OnlineTime
        x[openTicketsIndex].type = StatType.TicketDetails
        data.axes.x = x.filter(
            (x, i) =>
                ![
                    ticketsDetailsIndex,
                    lastSessionIndex,
                    firstSessionIndex,
                    onlineIndex,
                    agentTimezoneIndex,
                ].includes(i)
        )

        const onlineTimeTypeIndex = data.axes.x.findIndex(
            (x) => x.type === StatType.OnlineTime
        )
        data.axes.x[onlineTimeTypeIndex].name = 'Online status'
        data.axes.x[onlineTimeTypeIndex].type = StatType.OnlineState

        data.lines = data.lines.map((line) =>
            line.reduce((acc, value, index) => {
                if (!acc || !value) {
                    return acc
                }

                if (index === openTicketsIndex) {
                    acc.push({
                        ...value,
                        details: line[ticketsDetailsIndex].value,
                    } as TicketDetailStatCell)
                } else if (index === onlineTimeIndex) {
                    acc.push({
                        ...value,
                        extra: {
                            timezone: line[agentTimezoneIndex].value,
                            isOnline: line[onlineIndex].value,
                            firstSession: line[firstSessionIndex].value,
                            lastSession: line[lastSessionIndex].value,
                        },
                    } as OnlineTimeDetailStatCell)
                } else if (
                    ![
                        ticketsDetailsIndex,
                        agentTimezoneIndex,
                        onlineIndex,
                        firstSessionIndex,
                        lastSessionIndex,
                    ].includes(index)
                ) {
                    acc.push(value)
                }
                return acc
            }, [] as (NumericStatCell | OnlineTimeDetailStatCell | TicketDetailStatCell)[])
        )
    })
}

export default withFeaturePaywall(AccountFeature.UsersLiveStatistics)(
    LiveAgents
)
