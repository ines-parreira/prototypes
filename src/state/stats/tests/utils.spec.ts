import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {LegacyStatsFilters} from 'models/stat/types'
import {
    fromLegacyStatsFilters,
    fromPartialLegacyStatsFilters,
} from 'state/stats/utils'

const agents = [1, 2]
const channels = ['2134', '234']
const period = {
    start_datetime: '2021-04-02T00:00:00.000Z',
    end_datetime: '2021-04-02T23:59:59.999Z',
}

describe('fromPartialLegacyStatsFilters', () => {
    it('should transform partial LegacyFilters into Partial StatsFiltersWithLogicalOperators', () => {
        const legacyFilters: Partial<LegacyStatsFilters> = {
            agents,
            channels,
        }

        expect(fromPartialLegacyStatsFilters(legacyFilters)).toEqual({
            agents: withDefaultLogicalOperator(agents),
            channels: withDefaultLogicalOperator(channels),
        })
    })
})

describe('fromLegacyStatsFilters', () => {
    it('should transform LegacyFilters into Partial StatsFiltersWithLogicalOperators', () => {
        const legacyFilters: LegacyStatsFilters = {
            period,
            agents,
            channels,
        }

        expect(fromLegacyStatsFilters(legacyFilters)).toEqual({
            period,
            agents: withDefaultLogicalOperator(agents),
            channels: withDefaultLogicalOperator(channels),
        })
    })
})
