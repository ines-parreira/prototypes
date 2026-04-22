import type { ConditionItem } from './types'
import {
    getShortLabel,
    isConditionDisabled,
    isSameCondition,
    makeConditionItem,
} from './types'

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

describe('isConditionDisabled', () => {
    const priorityHigh = makeConditionItem(
        'ticket_fields',
        10,
        'high',
        'Priority / high',
    )
    const priorityLow = makeConditionItem(
        'ticket_fields',
        10,
        'low',
        'Priority / low',
    )
    const priorityNested = makeConditionItem(
        'ticket_fields',
        10,
        'Parent::Child',
        'Priority / Parent > Child',
    )
    const regionEU = makeConditionItem('ticket_fields', 20, 'EU', 'Region / EU')
    const urgentTag = makeConditionItem('tags', 1, 'urgent', 'urgent')
    const vipTag = makeConditionItem('tags', 2, 'vip', 'vip')

    it.each<
        [string, ConditionItem, ConditionItem[], number | undefined, boolean]
    >([
        [
            'already selected ticket field is never disabled',
            priorityHigh,
            [priorityHigh],
            5,
            false,
        ],
        [
            'already selected tag is never disabled',
            urgentTag,
            [urgentTag],
            5,
            false,
        ],
        [
            'already selected item stays enabled even at global cap',
            urgentTag,
            [urgentTag, vipTag],
            2,
            false,
        ],
        [
            'global cap reached blocks a new tag',
            vipTag,
            [urgentTag, priorityHigh],
            2,
            true,
        ],
        [
            'tag is not blocked by an existing ticket-field selection',
            urgentTag,
            [priorityHigh],
            5,
            false,
        ],
        [
            'ticket field is blocked when a sibling value for the same root is selected',
            priorityLow,
            [priorityHigh],
            5,
            true,
        ],
        [
            'ticket field is blocked when a nested sibling for the same root is selected',
            priorityNested,
            [priorityHigh],
            5,
            true,
        ],
        [
            'ticket field is not blocked by selections for a different root',
            priorityHigh,
            [regionEU],
            5,
            false,
        ],
        [
            'maxSelections undefined means no global cap',
            vipTag,
            [urgentTag, priorityHigh, regionEU],
            undefined,
            false,
        ],
    ])('%s', (_, condition, selectedConditions, maxSelections, expected) => {
        expect(
            isConditionDisabled(condition, selectedConditions, maxSelections),
        ).toBe(expected)
    })
})
