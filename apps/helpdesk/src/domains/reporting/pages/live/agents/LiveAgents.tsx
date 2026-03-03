import { useCallback, useMemo } from 'react'

import {
    LiveAgentsRealtimeListener,
    useCustomAgentUnavailableStatusesFlag,
} from '@repo/agent-status'
import { produce } from 'immer'
import moment from 'moment-timezone'

import {
    stats as statsConfig,
    USERS_PERFORMANCE_OVERVIEW,
} from 'domains/reporting/config/stats'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import type {
    AgentAvailabilityStatCell,
    LegacyStatsFilters,
    NumericStatAxisValue,
    NumericStatCell,
    OnlineTimeDetailStatCell,
    Stat,
    TicketDetailStatCell,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import { StatType } from 'domains/reporting/models/stat/types'
import TableStat from 'domains/reporting/pages/common/components/charts/TableStat/TableStat'
import StatCurrentDate from 'domains/reporting/pages/common/components/StatCurrentDate'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import StatWrapper from 'domains/reporting/pages/common/layout/StatWrapper'
import { usePerformancePageAgentAvailabilities } from 'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentAvailabilities'
import css from 'domains/reporting/pages/live/agents/LiveAgents.less'
import { LiveAgentsFilters } from 'domains/reporting/pages/live/agents/LiveAgentsFilters'
import StatsFiltersContext from 'domains/reporting/pages/StatsFiltersContext'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import Navigation from 'pages/common/components/Navigation/Navigation'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import { AccountFeature } from 'state/currentAccount/types'
import { getUserIdsFromLiveAgentsPerformance } from 'state/entities/stats/selectors'

export type OnlineChoice = 'status_online' | 'time_online'
const LIVE_AGENTS_STAT_NAME = 'live-agents-stat'

function LiveAgents() {
    const isAgentAvailabilityEnabled = useCustomAgentUnavailableStatusesFlag()
    const { cleanStatsFilters: statsFilters, userTimezone } = useAppSelector(
        getCleanStatsFiltersWithTimezone,
    )

    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
        const currentDay = userTimezone ? moment().tz(userTimezone) : moment()
        const { channels, agents } = statsFilters
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
        return (
            userPerformance &&
            formatUserPerformanceData(
                userPerformance,
                isAgentAvailabilityEnabled,
            )
        )
    }, [userPerformance, isAgentAvailabilityEnabled])

    const userIds = useAppSelector(getUserIdsFromLiveAgentsPerformance)

    usePerformancePageAgentAvailabilities({
        enabled: isAgentAvailabilityEnabled,
    })

    return (
        <StatsFiltersContext.Provider value={pageStatsFilters}>
            {isAgentAvailabilityEnabled && (
                <LiveAgentsRealtimeListener userIds={userIds} />
            )}
            <StatsPage
                title="Live agents"
                description="Live Agents will show you the work agents have accomplished over the day."
                helpUrl="https://link.gorgias.com/w05"
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
                                        context={{ tagColors: null }}
                                        data={stat.getIn(['data', 'data'])}
                                        meta={stat.get('meta')}
                                        config={statsConfig.get(
                                            USERS_PERFORMANCE_OVERVIEW,
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
    stat: Stat<TwoDimensionalChart<NumericStatAxisValue, NumericStatCell[]>>,
    isAgentAvailabilityEnabled: boolean,
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
                    | AgentAvailabilityStatCell
                    | {
                          type: StatType.User
                          value: { name: string; id: number }
                      }
                )[]
            >
        >
    >(stat, (statDraft) => {
        const {
            data: { data },
        } = statDraft
        const {
            axes: { x },
        } = data
        const openTicketsIndex = x.findIndex((x) => x.name === 'Open tickets')
        const ticketsDetailsIndex = x.findIndex(
            (x) => x.name === 'Open tickets per channel',
        )
        const onlineTimeIndex = x.findIndex((x) => x.name === 'Online time')
        const agentTimezoneIndex = x.findIndex(
            (x) => x.name === 'Agent timezone',
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
                ].includes(i),
        )

        const onlineTimeTypeIndex = data.axes.x.findIndex(
            (x) => x.type === StatType.OnlineTime,
        )
        data.axes.x[onlineTimeTypeIndex].name = 'Online status'
        data.axes.x[onlineTimeTypeIndex].type = StatType.OnlineState

        // Calculate splice index for Availability column
        const SECOND_COLUMN_INDEX = 1
        const availabilitySpliceIdx = isAgentAvailabilityEnabled
            ? onlineTimeTypeIndex > -1
                ? onlineTimeTypeIndex + 1
                : SECOND_COLUMN_INDEX
            : -1

        if (isAgentAvailabilityEnabled) {
            data.axes.x.splice(availabilitySpliceIdx, 0, {
                name: 'Availability',
                type: StatType.AgentAvailability,
            })
        }

        data.lines = data.lines.map((line) => {
            const processedLine = line.reduce(
                (acc, value, index) => {
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
                },
                [] as (
                    | NumericStatCell
                    | OnlineTimeDetailStatCell
                    | TicketDetailStatCell
                    | AgentAvailabilityStatCell
                    | {
                          type: StatType.User
                          value: { name: string; id: number }
                      }
                )[],
            )

            // Add AgentAvailabilityStatCell if the feature is enabled
            if (isAgentAvailabilityEnabled && availabilitySpliceIdx >= 0) {
                const userCell = line.find(
                    (cell) => cell.type === StatType.User,
                )

                if (
                    !userCell ||
                    !('value' in userCell) ||
                    !userCell.value ||
                    typeof userCell.value !== 'object' ||
                    !('id' in userCell.value) ||
                    typeof userCell.value.id !== 'number'
                ) {
                    return processedLine
                }

                const userId = userCell.value.id

                // Always add cell to maintain column alignment
                processedLine.splice(availabilitySpliceIdx, 0, {
                    type: StatType.AgentAvailability,
                    value: userId,
                } as AgentAvailabilityStatCell)
            }

            return processedLine
        })
    })
}

export default withFeaturePaywall(AccountFeature.UsersLiveStatistics)(
    LiveAgents,
)
