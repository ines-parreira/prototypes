import type { ConditionItem } from './types'
import { getShortLabel, isSameCondition, makeConditionItem } from './types'

describe('isSameCondition', () => {
    it.each<[string, ConditionItem, ConditionItem, boolean]>([
        [
            'same tag (category + value match, fieldId irrelevant)',
            {
                category: 'tags',
                fieldId: 1,
                value: 'urgent',
                displayLabel: 'urgent',
            },
            {
                category: 'tags',
                fieldId: 99,
                value: 'urgent',
                displayLabel: 'Urgent',
            },
            true,
        ],
        [
            'same ticket_field (category + value + fieldId all match)',
            {
                category: 'ticket_fields',
                fieldId: 10,
                value: 'optA',
                displayLabel: 'x',
            },
            {
                category: 'ticket_fields',
                fieldId: 10,
                value: 'optA',
                displayLabel: 'y',
            },
            true,
        ],
        [
            'different categories',
            { category: 'tags', fieldId: 1, value: 'urgent', displayLabel: '' },
            {
                category: 'ticket_fields',
                fieldId: 1,
                value: 'urgent',
                displayLabel: '',
            },
            false,
        ],
        [
            'ticket_fields with same value but different fieldId',
            {
                category: 'ticket_fields',
                fieldId: 10,
                value: 'optA',
                displayLabel: '',
            },
            {
                category: 'ticket_fields',
                fieldId: 20,
                value: 'optA',
                displayLabel: '',
            },
            false,
        ],
        [
            'same category and fieldId but different value',
            { category: 'tags', fieldId: 1, value: 'urgent', displayLabel: '' },
            { category: 'tags', fieldId: 1, value: 'vip', displayLabel: '' },
            false,
        ],
    ])('%s -> %s', (_, a, b, expected) => {
        expect(isSameCondition(a, b)).toBe(expected)
    })
})

describe('getShortLabel', () => {
    it.each<[string, ConditionItem, string]>([
        [
            'tag returns displayLabel as-is',
            makeConditionItem('tags', 1, 'urgent', 'urgent'),
            'urgent',
        ],
        [
            'ticket_field with flat value',
            makeConditionItem('ticket_fields', 10, 'optA', 'Priority / optA'),
            'optA',
        ],
        [
            'ticket_field with nested value returns last segment',
            makeConditionItem(
                'ticket_fields',
                10,
                'L1::L2::leaf',
                'Cat / L1 > L2 > leaf',
            ),
            'leaf',
        ],
    ])('%s', (_, item, expected) => {
        expect(getShortLabel(item)).toBe(expected)
    })
})
