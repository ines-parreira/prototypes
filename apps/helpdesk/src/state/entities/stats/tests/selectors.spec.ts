import type { StatData } from 'domains/reporting/models/stat/types'
import { StatType } from 'domains/reporting/models/stat/types'
import { userPerformanceOverview } from 'fixtures/stats'

import {
    getLiveAgentsPerformanceStat,
    getStats,
    getUserIdsFromLiveAgentsPerformance,
} from '../selectors'
import {
    statsWithEmptyCells,
    statsWithInvalidUserIds,
    statsWithNoUserCells,
    statsWithNullOrUndefinedCells,
} from './fixtures'
import { createStateWithLiveAgentsStat, createStateWithStats } from './utils'

describe('stats entities selectors', () => {
    describe('getStats', () => {
        it('should return the stats state', () => {
            const statsState = {
                'some-stat': { meta: {}, data: {} as StatData },
            }
            const state = createStateWithStats(statsState)

            expect(getStats(state)).toEqual(statsState)
        })
    })

    describe('getLiveAgentsPerformanceStat', () => {
        it('should return undefined when stat does not exist', () => {
            const state = createStateWithStats({})

            expect(getLiveAgentsPerformanceStat(state)).toBeUndefined()
        })

        it('should return the live agents performance stat', () => {
            const state = createStateWithLiveAgentsStat(userPerformanceOverview)

            expect(getLiveAgentsPerformanceStat(state)).toEqual(
                userPerformanceOverview,
            )
        })
    })

    describe('getUserIdsFromLiveAgentsPerformance', () => {
        it('should return empty array when stat does not exist', () => {
            const state = createStateWithStats({})

            expect(getUserIdsFromLiveAgentsPerformance(state)).toEqual([])
        })

        it('should return empty array when stat has no data', () => {
            const state = createStateWithLiveAgentsStat({
                meta: {},
                data: {} as StatData,
            })

            expect(getUserIdsFromLiveAgentsPerformance(state)).toEqual([])
        })

        it('should return empty array when stat data has no lines', () => {
            const state = createStateWithLiveAgentsStat({
                meta: {},
                data: {
                    data: {
                        axes: { x: [] },
                        delta: undefined,
                        name: '',
                        type: StatType.Number,
                        value: 0,
                    },
                },
            })

            expect(getUserIdsFromLiveAgentsPerformance(state)).toEqual([])
        })

        it('should return empty array when lines is empty', () => {
            const state = createStateWithLiveAgentsStat({
                meta: {},
                data: {
                    data: {
                        axes: { x: [] },
                        lines: [],
                    },
                    label: '',
                },
            })

            expect(getUserIdsFromLiveAgentsPerformance(state)).toEqual([])
        })

        it('should extract user IDs from userPerformanceOverview fixture', () => {
            const state = createStateWithLiveAgentsStat(userPerformanceOverview)

            expect(getUserIdsFromLiveAgentsPerformance(state)).toEqual([1])
        })

        it('should filter out invalid user IDs (zero and negative)', () => {
            const state = createStateWithLiveAgentsStat(statsWithInvalidUserIds)

            expect(getUserIdsFromLiveAgentsPerformance(state)).toEqual([1, 2])
        })

        it('should handle lines where there is no User cell', () => {
            const state = createStateWithLiveAgentsStat(statsWithNoUserCells)

            expect(getUserIdsFromLiveAgentsPerformance(state)).toEqual([1])
        })

        it('should handle empty cells in lines', () => {
            const state = createStateWithLiveAgentsStat(statsWithEmptyCells)

            expect(getUserIdsFromLiveAgentsPerformance(state)).toEqual([1, 2])
        })

        it('should handle null or undefined cells', () => {
            const state = createStateWithLiveAgentsStat(
                statsWithNullOrUndefinedCells,
            )

            expect(getUserIdsFromLiveAgentsPerformance(state)).toEqual([1, 2])
        })
    })
})
