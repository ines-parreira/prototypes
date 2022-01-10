import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'
import moment from 'moment-timezone'
import produce from 'immer'

import {stats as statsConfig, USERS_PERFORMANCE_OVERVIEW} from 'config/stats'
import {getStatsFiltersJS} from 'state/stats/selectors'
import {PeriodStatsFilterValue, StatsFilterType} from 'state/stats/types'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'
import {getTimezone} from 'state/currentUser/selectors'
import {TicketChannel} from 'business/types/ticket'
import {
    NumericStatAxisValue,
    Stat,
    TwoDimensionalChart,
    StatType,
    NumericStatCell,
    OnlineTimeDetailStatCell,
    TicketDetailStatCell,
} from 'models/stat/types'

import StatsPage from './StatsPage'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import AgentsStatsFilter from './AgentsStatsFilter'
import StatCurrentDate from './common/components/StatCurrentDate'
import css from './LiveAgents.less'
import StatWrapper from './StatWrapper'
import useStatResource from './useStatResource'
import TableStat from './common/components/charts/TableStat/TableStat'

const LIVE_AGENTS_STAT_NAME = 'live-agents-stat'

function LiveAgents() {
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

    const [userPerformance, isFetchingUserPerformance] = useStatResource<
        TwoDimensionalChart<NumericStatAxisValue, NumericStatCell[]>
    >({
        statName: LIVE_AGENTS_STAT_NAME,
        resourceName: USERS_PERFORMANCE_OVERVIEW,
        statsFilters: pageStatsFilters,
    })

    const formattedUserPerformance = useMemo(() => {
        return userPerformance && formatUserPerformanceData(userPerformance)
    }, [userPerformance])

    return (
        <StatsPage
            title="Live agents"
            description="Live Agents will show you the work agents have accomplished over the day."
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
                            <TableStat
                                name={LIVE_AGENTS_STAT_NAME}
                                context={{tagColors: null}}
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                config={statsConfig.get(
                                    USERS_PERFORMANCE_OVERVIEW
                                )}
                            />
                        )}
                    </StatWrapper>
                </>
            )}
        </StatsPage>
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
