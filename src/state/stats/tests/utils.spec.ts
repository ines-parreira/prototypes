import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {LegacyStatsFilters} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {
    fromLegacyAndLogicalOperatorStatsFilters,
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

describe('fromLegacyAndLogicalOperatorStatsFilters', () => {
    it('should merge the legacy stats filters with logical operators', () => {
        const legacyFilters: LegacyStatsFilters = {
            period,
            agents,
            channels,
        }
        const statsFiltersWithLogicalOperators = {
            period: {
                start_datetime: '2022-05-03T00:00:00.000Z',
                end_datetime: '2022-05-04T23:59:59.999Z',
            },
            agents: {
                values: [7, 8],
                operator: LogicalOperatorEnum.ALL_OF,
            },
            channels: {
                values: ['30', '40'],
                operator: LogicalOperatorEnum.NOT_ONE_OF,
            },
            integrations: {
                values: [45, 55],
                operator: LogicalOperatorEnum.ONE_OF,
            },
        }

        expect(
            fromLegacyAndLogicalOperatorStatsFilters(
                legacyFilters,
                statsFiltersWithLogicalOperators
            )
        ).toEqual({
            period: legacyFilters.period,
            agents: {
                values: legacyFilters.agents,
                operator: statsFiltersWithLogicalOperators.agents.operator,
            },
            channels: {
                values: legacyFilters.channels,
                operator: statsFiltersWithLogicalOperators.channels.operator,
            },
        })
    })
})
