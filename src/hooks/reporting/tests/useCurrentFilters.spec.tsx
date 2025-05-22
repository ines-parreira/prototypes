import { act } from '@testing-library/react'

import useCurrentFilters, {
    CURRENT_FILTERS,
    getValidator,
    validateAndParseFilters,
} from 'hooks/reporting/useCurrentFilters'
import {
    isAggregationWindowFilter,
    isCustomFieldFilter,
    isFilterWithLogicalOperator,
    isPeriodFilter,
    isTagFilter,
} from 'models/reporting/queryFactories/utils'
import {
    FilterKey,
    StatsFiltersWithLogicalOperator,
    TagFilterInstanceId,
} from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { renderHook } from 'utils/testing/renderHook'

const period = {
    start_datetime: '2019-09-19T00:00:00Z',
    end_datetime: '2019-09-25T23:59:59Z',
}
const filters = {
    period,
    agents: {
        values: [789726418],
        operator: LogicalOperatorEnum.ONE_OF,
    },
    customFields: [
        {
            customFieldId: 5235,
            values: ['5235::France'],
            operator: LogicalOperatorEnum.NOT_ONE_OF,
        },
        {
            customFieldId: 4960,
            operator: LogicalOperatorEnum.ONE_OF,
            values: [],
        },
    ],
    slaPolicies: {
        values: ['c489f8ec-0ca8-404b-8c4b-153cb578e212'],
        operator: LogicalOperatorEnum.ONE_OF,
    },
} as StatsFiltersWithLogicalOperator

const logSpy = jest.spyOn(console, 'error')

describe('useCurrentFilters', () => {
    beforeEach(() => {
        sessionStorage.clear()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return the default value', () => {
        const { result } = renderHook(() => useCurrentFilters({ period }))
        const response = JSON.stringify({
            period: filters.period,
        })
        expect(sessionStorage.getItem(CURRENT_FILTERS)).toStrictEqual(response)
        expect(result.current.filters).toStrictEqual(JSON.parse(response))
    })

    it('should save the filters on sessionStorage and return them', () => {
        const { result } = renderHook(() => useCurrentFilters({ period }))

        act(() => {
            result.current.persistFilters(filters)
        })

        const response = JSON.stringify(filters)
        expect(sessionStorage.getItem(CURRENT_FILTERS)).toStrictEqual(response)
        expect(result.current.filters).toStrictEqual(filters)
    })

    it('should return default value if the filters retried are not correctly typed', () => {
        sessionStorage.setItem(
            CURRENT_FILTERS,
            JSON.stringify({ period, test: 'false' }),
        )
        const { result } = renderHook(() => useCurrentFilters({ period }))
        expect(result.current.filters).toStrictEqual({ period })
        expect(logSpy).toHaveBeenCalledWith('Invalid filter type.')
    })
})

describe('validateAndParseFilters', () => {
    const defaultValue = {
        [FilterKey.Period]: {
            start_datetime: '1970-01-01T00:00:00+00:00',
            end_datetime: '1970-01-01T00:00:00+00:00',
        },
    }

    it('should return default filters if already equal', () => {
        expect(
            validateAndParseFilters(JSON.stringify(defaultValue), defaultValue),
        ).toStrictEqual(defaultValue)
    })

    it('should check if the filters object is typed correctly', () => {
        const filters = {
            [FilterKey.Period]: {
                start_datetime: '2020-01-01T00:00:00+00:00',
                end_datetime: '2020-01-01T00:00:00+00:00',
            },
            [FilterKey.CustomFields]: [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    customFieldId: 'customFieldId',
                    values: ['1::asd'],
                },
            ],
            [FilterKey.Agents]: {
                values: ['Agent1', 'Agent2'],
                operator: LogicalOperatorEnum.NOT_ONE_OF,
            },
            [FilterKey.Tags]: [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [1, 2],
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ],
        }

        expect(
            validateAndParseFilters(JSON.stringify(filters), defaultValue),
        ).toStrictEqual(filters)
    })

    it('should return default filters for invalid JSON input', () => {
        expect(
            validateAndParseFilters('invalid json', defaultValue),
        ).toStrictEqual(defaultValue)
        expect(logSpy).toHaveBeenCalled()
    })

    it('should return default filters for empty filters object', () => {
        expect(
            validateAndParseFilters(JSON.stringify({}), defaultValue),
        ).toStrictEqual(defaultValue)
        expect(logSpy).toHaveBeenCalledWith('Invalid filter structure.')
    })

    it('should return default filters when period is missing', () => {
        const filters = {
            [FilterKey.Agents]: {
                values: ['Agent1'],
                operator: LogicalOperatorEnum.ONE_OF,
            },
        }
        expect(
            validateAndParseFilters(JSON.stringify(filters), defaultValue),
        ).toStrictEqual(defaultValue)
        expect(logSpy).toHaveBeenCalledWith('Invalid filter structure.')
    })

    it('should handle multiple custom fields with different operators', () => {
        const filters = {
            [FilterKey.Period]: {
                start_datetime: '2020-01-01T00:00:00+00:00',
                end_datetime: '2020-01-01T00:00:00+00:00',
            },
            [FilterKey.CustomFields]: [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    customFieldId: 'field1',
                    values: ['value1'],
                },
                {
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    customFieldId: 'field2',
                    values: ['value2'],
                },
            ],
        }
        expect(
            validateAndParseFilters(JSON.stringify(filters), defaultValue),
        ).toStrictEqual(filters)
    })

    it('should return default filters for invalid filter value types', () => {
        const filters = {
            [FilterKey.Period]: {
                start_datetime: '2020-01-01T00:00:00+00:00',
                end_datetime: '2020-01-01T00:00:00+00:00',
            },
            [FilterKey.Agents]: [
                {
                    values: 'not-an-array',
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            ],
        }
        expect(
            validateAndParseFilters(JSON.stringify(filters), defaultValue),
        ).toStrictEqual(defaultValue)
        expect(logSpy).toHaveBeenCalledWith('Invalid filter type.')
    })

    it('should return default filters for invalid filter structure', () => {
        const filters = {
            [FilterKey.Period]: {
                start_datetime: '1970-01-01T00:00:00+00:00',
                end_datetime: '1970-01-01T00:00:00+00:00',
            },
            [FilterKey.CustomFields]: [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    customFieldId: 'customFieldId',
                    values: ['1::asd'],
                },
            ],
            [FilterKey.Agents]: ['Agent1', 'Agent2'],
            [FilterKey.Tags]: [
                {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [1, 2],
                },
            ],
        }

        expect(
            validateAndParseFilters(JSON.stringify(filters), defaultValue),
        ).toStrictEqual(defaultValue)
        expect(logSpy).toHaveBeenCalledWith('Invalid filter type.')
    })

    it('should return default filters for invalid filter keys', () => {
        expect(
            validateAndParseFilters(
                JSON.stringify({
                    [FilterKey.Period]: {
                        start_datetime: '1970-01-01T00:00:00+00:00',
                        end_datetime: '1970-01-01T00:00:00+00:00',
                    },
                    test: 'fail',
                }),
                defaultValue,
            ),
        ).toStrictEqual(defaultValue)
        expect(logSpy).toHaveBeenCalledWith('Invalid filter type.')
    })
})

describe('getValidator', () => {
    const similarKeyTypes = [
        FilterKey.Agents,
        FilterKey.CampaignStatuses,
        FilterKey.Campaigns,
        FilterKey.Channels,
        FilterKey.HelpCenters,
        FilterKey.Integrations,
        FilterKey.LocaleCodes,
        FilterKey.Score,
        FilterKey.SlaPolicies,
    ]

    it.each(similarKeyTypes)(
        'should test every similar FilterKey type',
        (filterKey) => {
            expect(getValidator(filterKey)).toEqual(isFilterWithLogicalOperator)
        },
    )

    it('should test FilterKey.AggregationWindow', () => {
        expect(getValidator(FilterKey.AggregationWindow)).toEqual(
            isAggregationWindowFilter,
        )
    })

    it('should test FilterKey.Tags', () => {
        expect(getValidator(FilterKey.Tags)).toEqual(isTagFilter)
    })

    it('should test FilterKey.CustomFields', () => {
        expect(getValidator(FilterKey.CustomFields)).toEqual(
            isCustomFieldFilter,
        )
    })

    it('should test FilterKey.Period', () => {
        expect(getValidator(FilterKey.Period)).toEqual(isPeriodFilter)
    })
})
