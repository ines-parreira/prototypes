import { USERS_PERFORMANCE_OVERVIEW } from 'domains/reporting/config/stats'
import type { Stat } from 'domains/reporting/models/stat/types'
import type { RootState } from 'state/types'

import type { StatsState } from '../types'

const LIVE_AGENTS_STAT_KEY = `live-agents-stat/${USERS_PERFORMANCE_OVERVIEW}`

/**
 * Helper function to create a mock RootState with stats entities.
 * Makes it easier to create state objects for testing selectors.
 */
export function createStateWithStats(stats: StatsState): RootState {
    return {
        entities: {
            stats,
        },
    } as RootState
}

/**
 * Helper function to create a mock RootState with a live agents performance stat.
 */
export function createStateWithLiveAgentsStat(
    stat: Stat | undefined,
): RootState {
    return createStateWithStats({
        [LIVE_AGENTS_STAT_KEY]: stat,
    })
}
