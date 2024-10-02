import {
    withDefaultCustomFieldAndLogicalOperator,
    withDefaultLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import {ReportingGranularity} from 'models/reporting/types'
import {
    AggregationWindow,
    LegacyStatsFilters,
    StatsFilters,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {
    fromFiltersWithLogicalOperators,
    fromLegacyStatsFilters,
    fromPartialLegacyStatsFilters,
    getAdjustedAggregationWindow,
    getAllowedAggregationWindows,
} from 'state/stats/utils'

const agents = [1, 2]
const channels = ['2134', '234']
const period = {
    start_datetime: '2021-04-02T00:00:00.000Z',
    end_datetime: '2021-04-02T23:59:59.999Z',
}
const aggregationWindow: AggregationWindow = ReportingGranularity.Day
const customIds = [123, 456]
const customValues = ['Field Name', 'Custom Field Name::Another']
const customFields = [
    `${customIds[0]}::${customValues[0]}`,
    `${customIds[1]}::${customValues[1]}`,
]
const campaignStatuses = ['active']

describe('fromPartialLegacyStatsFilters', () => {
    it('should transform partial LegacyFilters into Partial StatsFiltersWithLogicalOperators', () => {
        const legacyFilters: Partial<LegacyStatsFilters> = {
            aggregationWindow,
            agents,
            channels,
        }

        expect(fromPartialLegacyStatsFilters(legacyFilters)).toEqual({
            aggregationWindow,
            agents: withDefaultLogicalOperator(agents),
            channels: withDefaultLogicalOperator(channels),
        })
    })
    it('should transform partial LegacyCustomFilters into Partial StatsFiltersWithLogicalOperators', () => {
        const legacyFilters: Partial<LegacyStatsFilters> = {
            customFields,
        }

        expect(fromPartialLegacyStatsFilters(legacyFilters)).toEqual({
            customFields: [
                withDefaultCustomFieldAndLogicalOperator({
                    customFieldId: customIds[0],
                    values: [customValues[0]],
                }),
                withDefaultCustomFieldAndLogicalOperator({
                    customFieldId: customIds[1],
                    values: [customValues[1]],
                }),
            ],
            period: undefined,
        })
    })
    it('should transform any other filter into Partial StatsFiltersWithLogicalOperators', () => {
        const legacyFilters: Partial<LegacyStatsFilters> = {
            campaignStatuses,
        }

        expect(fromPartialLegacyStatsFilters(legacyFilters)).toEqual({
            campaignStatuses: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: campaignStatuses,
            },
            period: undefined,
        })
    })
})

describe('fromLegacyStatsFilters', () => {
    it('should transform LegacyFilters into Partial StatsFiltersWithLogicalOperators', () => {
        const legacyFilters: LegacyStatsFilters = {
            period,
            aggregationWindow,
            agents,
            channels,
        }

        expect(fromLegacyStatsFilters(legacyFilters)).toEqual({
            period,
            aggregationWindow,
            agents: withDefaultLogicalOperator(agents),
            channels: withDefaultLogicalOperator(channels),
        })
    })
    it('should transform LegacyCustomFilters into Partial StatsFiltersWithLogicalOperators', () => {
        const legacyFilters: LegacyStatsFilters = {
            period,
            customFields,
        }

        expect(fromLegacyStatsFilters(legacyFilters)).toEqual({
            customFields: [
                withDefaultCustomFieldAndLogicalOperator({
                    customFieldId: customIds[0],
                    values: [customValues[0]],
                }),
                withDefaultCustomFieldAndLogicalOperator({
                    customFieldId: customIds[1],
                    values: [customValues[1]],
                }),
            ],
            period,
        })
    })
})

describe('fromFiltersWithLogicalOperators', () => {
    it('should transform into legacy stats filters', () => {
        const statsFiltersWithLogicalOperators = {
            period: {
                start_datetime: '2022-05-03T00:00:00.000Z',
                end_datetime: '2022-05-04T23:59:59.999Z',
            },
            aggregationWindow,
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
            customFields: [
                withDefaultCustomFieldAndLogicalOperator({
                    values: [customValues[0]],
                    customFieldId: customIds[0],
                }),
                withDefaultCustomFieldAndLogicalOperator({
                    values: [customValues[1]],
                    customFieldId: customIds[1],
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                }),
            ],
        }
        expect(
            fromFiltersWithLogicalOperators(statsFiltersWithLogicalOperators)
        ).toEqual({
            agents: statsFiltersWithLogicalOperators.agents.values,
            channels: statsFiltersWithLogicalOperators.channels.values,
            customFields: statsFiltersWithLogicalOperators.customFields.map(
                (filter) => filter.values[0]
            ),
            integrations: statsFiltersWithLogicalOperators.integrations.values,
            period: statsFiltersWithLogicalOperators.period,
            aggregationWindow,
        })
    })
})

describe('getAllowedAggregationWindows', () => {
    it('should return hour for a period of up to 1 day', () => {
        const period = {
            start_datetime: '2021-04-02T00:00:00.000Z',
            end_datetime: '2021-04-02T23:59:59.999Z',
        }
        expect(getAllowedAggregationWindows(period)).toEqual([
            ReportingGranularity.Hour,
        ])
    })

    it.each([
        {
            start_datetime: '2021-04-02T00:00:00.000Z',
            end_datetime: '2021-07-02T23:59:59.999Z',
        },
        {
            start_datetime: '2021-04-02T22:00:00.000Z',
            end_datetime: '2021-04-03T21:59:59.999Z',
        },
    ])(
        'should return day, week and month for a period from 2 to 92 day',
        (period) => {
            expect(getAllowedAggregationWindows(period)).toEqual([
                ReportingGranularity.Day,
                ReportingGranularity.Week,
                ReportingGranularity.Month,
            ])
        }
    )

    it('should return week and month for a period longer then 92 days', () => {
        const period = {
            start_datetime: '2021-04-02T00:00:00.000Z',
            end_datetime: '2021-08-02T23:59:59.999Z',
        }
        expect(getAllowedAggregationWindows(period)).toEqual([
            ReportingGranularity.Week,
            ReportingGranularity.Month,
        ])
    })
})

describe('getAdjustedAggregationWindow', () => {
    it('should return undefined if none defined', () => {
        const statsFilters = {
            period: {
                start_datetime: '2021-04-02T00:00:00.000Z',
                end_datetime: '2021-08-02T23:59:59.999Z',
            },
        }

        expect(getAdjustedAggregationWindow(statsFilters)).toEqual(undefined)
    })

    it('should return currently selected window if allowed', () => {
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: '2021-04-02T00:00:00.000Z',
                end_datetime: '2021-05-02T23:59:59.999Z',
            },
            aggregationWindow: ReportingGranularity.Week,
        }

        expect(getAdjustedAggregationWindow(statsFilters)).toEqual(
            statsFilters.aggregationWindow
        )
    })

    it('should return first allowed aggregation window', () => {
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: '2021-04-02T00:00:00.000Z',
                end_datetime: '2021-08-02T23:59:59.999Z',
            },
            aggregationWindow: ReportingGranularity.Week,
        }

        expect(getAdjustedAggregationWindow(statsFilters)).toEqual(
            getAllowedAggregationWindows(statsFilters.period)[0]
        )
    })
})
