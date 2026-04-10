import { buildFullQuery } from 'AIJourney/utils/conditionQueryBuilder/conditionQueryBuilder'

import type {
    ConditionsSchema,
    ConditionState,
} from '../../types/conditionField'

const schema: ConditionsSchema = {
    operators: {
        comparison: ['eq', 'neq', 'gt'],
        set: ['contains', 'containsAny', 'containsAll', 'notContainsAny'],
        unary: ['isEmpty', 'isNotEmpty'],
    },
    objects: {
        shopper: {
            fields: {
                sms_state: { type: 'string', operators: ['eq', 'isEmpty'] },
                order_count: { type: 'number', operators: ['gt'] },
                tags: {
                    type: 'array_string',
                    operators: [
                        'contains',
                        'containsAny',
                        'containsAll',
                        'notContainsAny',
                    ],
                },
                last_order: { type: 'datetime', operators: ['gt'] },
            },
        },
    },
}

const baseCondition: ConditionState = {
    object: 'shopper',
    field: 'sms_state',
    isAggregate: false,
    operator: 'eq',
    value: 'subscribed',
}

describe('buildFullQuery', () => {
    it('returns empty string for empty conditions array', () => {
        expect(buildFullQuery([], schema)).toBe('')
    })

    describe('filtering invalid conditions', () => {
        it('filters out conditions with no object', () => {
            const condition: ConditionState = { ...baseCondition, object: null }
            expect(buildFullQuery([condition], schema)).toBe('')
        })

        it('filters out conditions with no field', () => {
            const condition: ConditionState = { ...baseCondition, field: null }
            expect(buildFullQuery([condition], schema)).toBe('')
        })

        it('filters out conditions with an unknown object', () => {
            const condition: ConditionState = {
                ...baseCondition,
                object: 'unknown',
            }
            expect(buildFullQuery([condition], schema)).toBe('')
        })

        it('filters out conditions with an unknown field', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'unknown_field',
            }
            expect(buildFullQuery([condition], schema)).toBe('')
        })

        it('filters out conditions with an unknown aggregate', () => {
            const condition: ConditionState = {
                ...baseCondition,
                isAggregate: true,
                field: 'unknown_aggregate',
            }
            expect(buildFullQuery([condition], schema)).toBe('')
        })
    })

    describe('unary operators', () => {
        it('builds a unary condition without a value', () => {
            const condition: ConditionState = {
                ...baseCondition,
                operator: 'isEmpty',
                value: null,
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'isEmpty(shopper.sms_state)',
            )
        })
    })

    describe('filtering conditions with missing values (non-unary)', () => {
        it('filters out conditions with null value', () => {
            const condition: ConditionState = { ...baseCondition, value: null }
            expect(buildFullQuery([condition], schema)).toBe('')
        })

        it('filters out conditions with undefined value', () => {
            const condition: ConditionState = {
                ...baseCondition,
                value: undefined as unknown as null,
            }
            expect(buildFullQuery([condition], schema)).toBe('')
        })

        it('filters out conditions with empty string value', () => {
            const condition: ConditionState = { ...baseCondition, value: '' }
            expect(buildFullQuery([condition], schema)).toBe('')
        })
    })

    describe('formatFieldValue', () => {
        it('wraps string type values in single quotes', () => {
            const condition: ConditionState = {
                ...baseCondition,
                value: 'subscribed',
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "eq(shopper.sms_state, 'subscribed')",
            )
        })

        it('converts number type values to a bare numeric string', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'order_count',
                operator: 'gt',
                value: 5,
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'gt(shopper.order_count, 5)',
            )
        })

        it.each(['contains', 'containsAny', 'containsAll', 'notContainsAny'])(
            'wraps a single value in array notation for "%s" operator',
            (operator) => {
                const condition: ConditionState = {
                    ...baseCondition,
                    field: 'tags',
                    operator,
                    value: 'vip',
                }
                expect(buildFullQuery([condition], schema)).toBe(
                    `${operator}(shopper.tags, ['vip'])`,
                )
            },
        )

        it('splits comma-separated values into array elements for contains operators', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'containsAny',
                value: 'vip, premium, gold',
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "containsAny(shopper.tags, ['vip', 'premium', 'gold'])",
            )
        })

        it('wraps datetime type values in single quotes', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'last_order',
                operator: 'gt',
                value: '30d',
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "gt(shopper.last_order, '30d')",
            )
        })
    })

    describe('multiple conditions', () => {
        it('joins multiple valid conditions with &&', () => {
            const c1: ConditionState = { ...baseCondition, value: 'subscribed' }
            const c2: ConditionState = {
                ...baseCondition,
                field: 'order_count',
                operator: 'gt',
                value: 3,
            }
            expect(buildFullQuery([c1, c2], schema)).toBe(
                "eq(shopper.sms_state, 'subscribed') && gt(shopper.order_count, 3)",
            )
        })

        it('skips invalid conditions in a mixed array', () => {
            const valid: ConditionState = {
                ...baseCondition,
                value: 'subscribed',
            }
            const invalid: ConditionState = { ...baseCondition, object: null }
            expect(buildFullQuery([valid, invalid], schema)).toBe(
                "eq(shopper.sms_state, 'subscribed')",
            )
        })
    })
})
