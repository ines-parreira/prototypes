import {
    withDefaultCustomFieldAndLogicalOperator,
    withDefaultLogicalOperator,
} from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import {
    AggregationWindow,
    FilterKey,
    LegacyStatsFilters,
    SavedFilterDraft,
    StatsFilters,
    StatsFiltersWithLogicalOperator,
    TagFilterInstanceId,
} from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import {
    excludeFromFiltersWithLogicalOperators,
    fromFiltersWithLogicalOperators,
    fromLegacyStatsFilters,
    fromPartialLegacyStatsFilters,
    getAdjustedAggregationWindow,
    getAllowedAggregationWindows,
    savedFilterDraftFiltersFromFiltersWithLogicalOperators,
    statsFiltersWithLogicalOperatorsFromSavedFilters,
} from 'state/stats/utils'

const agents = [1, 2]
const channels = ['2134', '234']
const period = {
    start_datetime: '2021-04-02T00:00:00.000Z',
    end_datetime: '2021-04-02T23:59:59.999Z',
}
const aggregationWindow: AggregationWindow = ReportingGranularity.Day
const customIds = [123, 456]
const customValues = [
    'Field Name',
    'Custom Field Name::Another',
    'Custom Field Name::AnotherOne',
]
const customFields = [
    `${customIds[0]}::${customValues[0]}`,
    `${customIds[1]}::${customValues[1]}`,
    `${customIds[1]}::${customValues[2]}`,
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
                    values: [customValues[1], customValues[2]],
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
                    values: [customValues[1], customValues[2]],
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
            tags: [
                {
                    values: [1, 2, 3],
                    operator: LogicalOperatorEnum.ONE_OF,
                    filterInstanceId: TagFilterInstanceId.First,
                },
                {
                    values: [5, 6],
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    filterInstanceId: TagFilterInstanceId.Second,
                },
            ],
        }
        expect(
            fromFiltersWithLogicalOperators(statsFiltersWithLogicalOperators),
        ).toEqual({
            agents: statsFiltersWithLogicalOperators.agents.values,
            channels: statsFiltersWithLogicalOperators.channels.values,
            customFields: statsFiltersWithLogicalOperators.customFields.map(
                (filter) => filter.values[0],
            ),
            integrations: statsFiltersWithLogicalOperators.integrations.values,
            period: statsFiltersWithLogicalOperators.period,
            aggregationWindow,
            tags: statsFiltersWithLogicalOperators.tags[0].values,
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
        },
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
            statsFilters.aggregationWindow,
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
            getAllowedAggregationWindows(statsFilters.period)[0],
        )
    })
})

describe('savedFilterDraftFromFiltersWithLogicalOperators', () => {
    it.each([FilterKey.Tags, FilterKey.CustomFields, FilterKey.Agents])(
        'should return nothing when filter empty',
        (filterKey) => {
            expect(
                savedFilterDraftFiltersFromFiltersWithLogicalOperators({
                    [FilterKey.Period]: {
                        start_datetime: '2021-04-02T00:00:00.000Z',
                        end_datetime: '2021-05-02T23:59:59.999Z',
                    },
                    [filterKey]: undefined,
                }),
            ).toEqual([])
        },
    )

    it('should return SavedFilter filters', () => {
        const filters: StatsFiltersWithLogicalOperator = {
            [FilterKey.Period]: {
                start_datetime: '2021-04-02T00:00:00.000Z',
                end_datetime: '2021-05-02T23:59:59.999Z',
            },
            [FilterKey.Tags]: [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [123],
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ],
            [FilterKey.CustomFields]: [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['123'],
                    customFieldId: 890,
                },
                {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                    customFieldId: 456,
                },
            ],
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123],
            },
        }

        const result =
            savedFilterDraftFiltersFromFiltersWithLogicalOperators(filters)

        expect(result).toContainEqual({
            member: FilterKey.Tags,
            values: [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['123'],
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ],
        })
        expect(result).toContainEqual({
            member: FilterKey.CustomFields,
            values: [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['123'],
                    custom_field_id: '890',
                },
                {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [],
                    custom_field_id: '456',
                },
            ],
        })
        expect(result).toContainEqual({
            member: FilterKey.Agents,
            values: ['123'],
            operator: LogicalOperatorEnum.ONE_OF,
        })
    })
})

describe('statsFiltersWithLogicalOperatorsFromSavedFilters', () => {
    it('should return statsFilters from saved filters', () => {
        const customFieldFilter = {
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['Some::value'],
            custom_field_id: '123',
        }
        const tagFilter = {
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['456'],
            filterInstanceId: TagFilterInstanceId.First,
        }
        const secondTagFilter = {
            operator: LogicalOperatorEnum.NOT_ONE_OF,
            values: ['765'],
            filterInstanceId: TagFilterInstanceId.Second,
        }
        const agentFilter = {
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['789'],
        }
        const campaignsFilter = {
            operator: LogicalOperatorEnum.ONE_OF,
            values: ['470'],
        }
        const savedFiltersDraft: SavedFilterDraft = {
            name: 'someName',
            filter_group: [
                {
                    member: FilterKey.CustomFields,
                    values: [customFieldFilter],
                },
                {
                    member: FilterKey.Tags,
                    values: [tagFilter, secondTagFilter],
                },
                {
                    member: FilterKey.Agents,
                    ...agentFilter,
                },
                {
                    member: FilterKey.Campaigns,
                    ...campaignsFilter,
                },
            ],
        }

        expect(
            statsFiltersWithLogicalOperatorsFromSavedFilters(
                savedFiltersDraft.filter_group,
            ),
        ).toEqual({
            [FilterKey.CustomFields]: [
                { ...customFieldFilter, customFieldId: 123 },
            ],
            [FilterKey.Tags]: [
                {
                    ...tagFilter,
                    values: tagFilter.values.map(Number),
                    filterInstanceId: TagFilterInstanceId.First,
                },
                {
                    ...secondTagFilter,
                    values: secondTagFilter.values.map(Number),
                    filterInstanceId: TagFilterInstanceId.Second,
                },
            ],
            [FilterKey.Agents]: {
                ...agentFilter,
                values: agentFilter.values.map(Number),
            },
            [FilterKey.Campaigns]: campaignsFilter,
        })
    })
})

describe('excludeFromFiltersWithLogicalOperators', () => {
    it('should return not excluded filters', () => {
        const filters: StatsFiltersWithLogicalOperator = {
            [FilterKey.Period]: {
                start_datetime: 'sdf',
                end_datetime: 'sdf',
            },
            [FilterKey.AggregationWindow]: ReportingGranularity.Day,
            [FilterKey.Agents]: withDefaultLogicalOperator([123]),
            [FilterKey.Integrations]: withDefaultLogicalOperator([123]),
            [FilterKey.CustomFields]: [
                { ...withDefaultLogicalOperator(['123']), customFieldId: 123 },
            ],
            [FilterKey.Tags]: [
                {
                    ...withDefaultLogicalOperator([123]),
                    filterInstanceId: TagFilterInstanceId.Second,
                },
            ],
        }
        const excludeFilters: Exclude<FilterKey, FilterKey.Period>[] = [
            FilterKey.AggregationWindow,
            FilterKey.Agents,
            FilterKey.CustomFields,
            FilterKey.Tags,
        ]

        expect(
            excludeFromFiltersWithLogicalOperators(filters, excludeFilters),
        ).toEqual({
            [FilterKey.Period]: {
                start_datetime: 'sdf',
                end_datetime: 'sdf',
            },
            [FilterKey.Integrations]: withDefaultLogicalOperator([123]),
        })
    })
})
