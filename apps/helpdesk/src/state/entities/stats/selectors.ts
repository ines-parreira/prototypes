import { createSelector } from 'reselect'

import { USERS_PERFORMANCE_OVERVIEW } from 'domains/reporting/config/stats'
import { StatType } from 'domains/reporting/models/stat/types'
import type { RootState } from 'state/types'

import type { StatsState } from './types'

const LIVE_AGENTS_STAT_NAME = 'live-agents-stat'

export const getStats = (state: RootState): StatsState => state.entities.stats

export const getLiveAgentsPerformanceStat = (state: RootState) => {
    const statKey = `${LIVE_AGENTS_STAT_NAME}/${USERS_PERFORMANCE_OVERVIEW}`
    return getStats(state)[statKey]
}

/**
 * Selector to extract user IDs from live agents performance data.
 * Returns an array of user IDs from the first cell of each line in the performance data.
 */
export const getUserIdsFromLiveAgentsPerformance = createSelector(
    getLiveAgentsPerformanceStat,
    (userPerformance): number[] => {
        const userPerformanceData = userPerformance?.data?.data
        if (!userPerformanceData) return []
        if (!('lines' in userPerformanceData)) return []

        const { lines } = userPerformanceData

        return lines.reduce<number[]>((acc, line) => {
            if (!Array.isArray(line)) return acc
            const userCell = line.find((cell) => cell?.type === StatType.User)
            if (
                userCell &&
                'value' in userCell &&
                userCell.value &&
                typeof userCell.value === 'object' &&
                'id' in userCell.value &&
                typeof userCell.value.id === 'number' &&
                userCell.value.id > 0
            ) {
                acc.push(userCell.value.id)
            }
            return acc
        }, [])
    },
)
