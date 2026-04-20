import type { SLAPolicyFilter } from '@gorgias/helpdesk-types'
import { SlaPolicyFilterOperation } from '@gorgias/helpdesk-types'

import type { ConditionItem } from '../../views/ConditionsSelect/types'
import { makeConditionItem } from '../../views/ConditionsSelect/types'
import {
    mapConditionsToFilters,
    mapFiltersToConditions,
} from '../mapConditionFilters'

describe('mapConditionsToFilters', () => {
    it('returns empty array for empty conditions', () => {
        expect(mapConditionsToFilters([])).toEqual([])
    })

    it.each<[string, ConditionItem[], SLAPolicyFilter[]]>([
        [
            'tags only',
            [
                makeConditionItem('tags', 1, 'urgent', 'urgent'),
                makeConditionItem('tags', 2, 'vip', 'vip'),
            ],
            [
                {
                    field: 'tags.name',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['urgent', 'vip'],
                },
            ],
        ],
        [
            'single custom field',
            [makeConditionItem('ticket_fields', 10, 'optA', 'Priority / optA')],
            [
                {
                    field: 'custom_fields[10].value',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['optA'],
                },
            ],
        ],
        [
            'multiple values for same custom field are grouped',
            [
                makeConditionItem(
                    'ticket_fields',
                    10,
                    'optA',
                    'Priority / optA',
                ),
                makeConditionItem(
                    'ticket_fields',
                    10,
                    'optB',
                    'Priority / optB',
                ),
            ],
            [
                {
                    field: 'custom_fields[10].value',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['optA', 'optB'],
                },
            ],
        ],
        [
            'different custom fields produce separate filters',
            [
                makeConditionItem(
                    'ticket_fields',
                    10,
                    'optA',
                    'Priority / optA',
                ),
                makeConditionItem('ticket_fields', 20, 'optX', 'Status / optX'),
            ],
            [
                {
                    field: 'custom_fields[10].value',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['optA'],
                },
                {
                    field: 'custom_fields[20].value',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['optX'],
                },
            ],
        ],
        [
            'mixed tags and fields',
            [
                makeConditionItem('tags', 1, 'urgent', 'urgent'),
                makeConditionItem(
                    'ticket_fields',
                    10,
                    'optA',
                    'Priority / optA',
                ),
            ],
            [
                {
                    field: 'tags.name',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['urgent'],
                },
                {
                    field: 'custom_fields[10].value',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['optA'],
                },
            ],
        ],
    ])('maps %s correctly', (_, conditions, expected) => {
        expect(mapConditionsToFilters(conditions)).toEqual(expected)
    })
})

describe('mapFiltersToConditions', () => {
    it('returns empty array for empty filters', () => {
        expect(mapFiltersToConditions([], { tags: [], fields: [] })).toEqual([])
    })

    it.each<
        [
            string,
            SLAPolicyFilter[],
            { tags: any[]; fields: any[] },
            ConditionItem[],
        ]
    >([
        [
            'tags filter with known tag',
            [
                {
                    field: 'tags.name',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['urgent'],
                },
            ],
            { tags: [{ id: 5, name: 'urgent' }], fields: [] },
            [makeConditionItem('tags', 5, 'urgent', 'urgent')],
        ],
        [
            'tag not found in lookups defaults fieldId to 0',
            [
                {
                    field: 'tags.name',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['unknown-tag'],
                },
            ],
            { tags: [], fields: [] },
            [makeConditionItem('tags', 0, 'unknown-tag', 'unknown-tag')],
        ],
        [
            'custom field filter',
            [
                {
                    field: 'custom_fields[10].value',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['optA'],
                },
            ],
            {
                tags: [],
                fields: [{ id: 10, label: 'Priority' }],
            },
            [makeConditionItem('ticket_fields', 10, 'optA', 'Priority / optA')],
        ],
        [
            'unknown custom field uses fallback label',
            [
                {
                    field: 'custom_fields[123].value',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['optA'],
                },
            ],
            { tags: [], fields: [] },
            [
                makeConditionItem(
                    'ticket_fields',
                    123,
                    'optA',
                    'Field #123 / optA',
                ),
            ],
        ],
        [
            'nested value uses formatted delimiter in label',
            [
                {
                    field: 'custom_fields[10].value',
                    operator: SlaPolicyFilterOperation.ContainsAll,
                    value: ['L1::L2'],
                },
            ],
            {
                tags: [],
                fields: [{ id: 10, label: 'Category' }],
            },
            [
                makeConditionItem(
                    'ticket_fields',
                    10,
                    'L1::L2',
                    'Category / L1 > L2',
                ),
            ],
        ],
    ])('maps %s correctly', (_, filters, lookups, expected) => {
        expect(mapFiltersToConditions(filters, lookups as any)).toEqual(
            expected,
        )
    })

    it('skips non-string values in filter.value', () => {
        const filters: SLAPolicyFilter[] = [
            {
                field: 'tags.name',
                operator: SlaPolicyFilterOperation.ContainsAll,
                value: ['urgent', 42 as any, true as any],
            },
        ]
        const result = mapFiltersToConditions(filters, {
            tags: [{ id: 1, name: 'urgent' }] as any,
            fields: [],
        })
        expect(result).toHaveLength(1)
        expect(result[0].value).toBe('urgent')
    })

    it('skips filters with unrecognized field patterns', () => {
        const filters: SLAPolicyFilter[] = [
            {
                field: 'some_unknown_field',
                operator: SlaPolicyFilterOperation.ContainsAll,
                value: ['x'],
            },
        ]
        expect(
            mapFiltersToConditions(filters, { tags: [], fields: [] }),
        ).toEqual([])
    })

    it('handles scalar filter.value by wrapping it', () => {
        const filters: SLAPolicyFilter[] = [
            {
                field: 'tags.name',
                operator: SlaPolicyFilterOperation.ContainsAll,
                value: 'single' as any,
            },
        ]
        const result = mapFiltersToConditions(filters, {
            tags: [] as any,
            fields: [],
        })
        expect(result).toEqual([
            makeConditionItem('tags', 0, 'single', 'single'),
        ])
    })
})
