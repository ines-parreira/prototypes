import {
    buildFullQuery,
    parseConditionsQuery,
} from 'AIJourney/utils/conditionQueryBuilder/conditionQueryBuilder'

import type {
    ConditionsSchema,
    ConditionState,
} from '../../types/conditionField'
import { DEFAULT_CONDITION } from '../../types/conditionField'

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
            aggregates: {
                orders: {
                    type: 'number',
                    operators: ['gt', 'isEmpty'],
                    supports_where: true,
                },
                orders_count: {
                    type: 'number',
                    operators: ['gt'],
                    supports_where: false,
                },
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
    whereClause: null,
    purchaseDateClause: null,
    isWhereVisible: false,
}

const baseAggregateCondition: ConditionState = {
    object: 'shopper',
    field: 'orders',
    isAggregate: true,
    operator: 'gt',
    value: 5,
    whereClause: null,
    purchaseDateClause: null,
    isWhereVisible: false,
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

        it('filters out conditions with an empty array value', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'containsAny',
                value: [],
            }
            expect(buildFullQuery([condition], schema)).toBe('')
        })

        it('filters out a contains condition whose string value contains only commas', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'containsAny',
                value: ',',
            }
            expect(buildFullQuery([condition], schema)).toBe('')
        })

        it('filters out a contains condition whose string value is only whitespace and commas', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'notContainsAny',
                value: ' , , ',
            }
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

        it('strips trailing comma and empty entry from contains value', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'containsAny',
                value: '1, 2, 3,',
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "containsAny(shopper.tags, ['1', '2', '3'])",
            )
        })

        it('formats a string array value directly into array notation', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'containsAny',
                value: ['vip', 'wholesale', 'new-customer'],
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "containsAny(shopper.tags, ['vip', 'wholesale', 'new-customer'])",
            )
        })

        it('formats a single-element string array into array notation', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'containsAny',
                value: ['vip'],
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "containsAny(shopper.tags, ['vip'])",
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

        it('escapes apostrophes in string values', () => {
            const condition: ConditionState = {
                ...baseCondition,
                value: "Women's K1 Flux",
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "eq(shopper.sms_state, 'Women\\'s K1 Flux')",
            )
        })

        it('escapes apostrophes in array values', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'containsAny',
                value: ["Women's K1 Flux"],
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "containsAny(shopper.tags, ['Women\\'s K1 Flux'])",
            )
        })

        it('escapes apostrophes in comma-separated contains string values', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'containsAll',
                value: "Women's K1 Flux, Men's T-Shirt",
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "containsAll(shopper.tags, ['Women\\'s K1 Flux', 'Men\\'s T-Shirt'])",
            )
        })

        it('escapes backslashes in string values', () => {
            const condition: ConditionState = {
                ...baseCondition,
                value: 'Summer\\Fall',
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "eq(shopper.sms_state, 'Summer\\\\Fall')",
            )
        })

        it('escapes backslash-apostrophe sequences in array values', () => {
            const condition: ConditionState = {
                ...baseCondition,
                field: 'tags',
                operator: 'containsAny',
                value: ["Women\\'s K1 Flux"],
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "containsAny(shopper.tags, ['Women\\\\\\'s K1 Flux'])",
            )
        })
    })

    describe('aggregate conditions with where clause', () => {
        it('builds an aggregate condition without a where clause', () => {
            expect(buildFullQuery([baseAggregateCondition], schema)).toBe(
                'gt(shopper.orders(), 5)',
            )
        })

        it('builds an aggregate condition with a binary where clause', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                whereClause: {
                    field: 'sms_state',
                    operator: 'eq',
                    value: 'subscribed',
                },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "gt(shopper.orders(eq(sms_state, 'subscribed')), 5)",
            )
        })

        it('builds an aggregate condition with a unary where clause', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                whereClause: {
                    field: 'sms_state',
                    operator: 'isEmpty',
                    value: null,
                },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'gt(shopper.orders(isEmpty(sms_state)), 5)',
            )
        })

        it('skips a where clause when its value is null for a binary operator', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                whereClause: {
                    field: 'sms_state',
                    operator: 'eq',
                    value: null,
                },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'gt(shopper.orders(), 5)',
            )
        })

        it('skips where clause when its value is an empty string for a binary operator', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                whereClause: {
                    field: 'sms_state',
                    operator: 'eq',
                    value: '',
                },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'gt(shopper.orders(), 5)',
            )
        })

        it('skips where clause when its field is an empty string', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                whereClause: {
                    field: '',
                    operator: 'eq',
                    value: 'subscribed',
                },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'gt(shopper.orders(), 5)',
            )
        })

        it('skips where clause when the aggregate does not support it', () => {
            const condition: ConditionState = {
                object: 'shopper',
                field: 'orders_count',
                isAggregate: true,
                operator: 'gt',
                value: 3,
                whereClause: {
                    field: 'sms_state',
                    operator: 'eq',
                    value: 'subscribed',
                },
                purchaseDateClause: null,
                isWhereVisible: false,
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'gt(shopper.orders_count(), 3)',
            )
        })

        it('builds a unary aggregate condition', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                operator: 'isEmpty',
                value: null,
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'isEmpty(shopper.orders())',
            )
        })
    })

    describe('aggregate conditions with purchaseDateClause', () => {
        it('puts the purchase_date term inside the aggregate for 30d period', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                purchaseDateClause: { operator: 'gt', value: '30d' },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "gt(shopper.orders(gt(purchase_date, '30d')), 5)",
            )
        })

        it('puts the correct term inside the aggregate for 90d period', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                purchaseDateClause: { operator: 'gt', value: '90d' },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "gt(shopper.orders(gt(purchase_date, '90d')), 5)",
            )
        })

        it('puts the correct term inside the aggregate for 365d period', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                purchaseDateClause: { operator: 'gt', value: '365d' },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "gt(shopper.orders(gt(purchase_date, '365d')), 5)",
            )
        })

        it('omits the purchase_date term when purchaseDateClause is null', () => {
            expect(buildFullQuery([baseAggregateCondition], schema)).toBe(
                'gt(shopper.orders(), 5)',
            )
        })

        it('omits the purchase_date term when purchaseDateClause value is null', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                purchaseDateClause: { operator: 'gt', value: null },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'gt(shopper.orders(), 5)',
            )
        })

        it('omits the purchase_date term when purchaseDateClause is isNotEmpty (all time)', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                purchaseDateClause: { operator: 'isNotEmpty', value: null },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'gt(shopper.orders(), 5)',
            )
        })

        it('combines where clause and purchase_date inside the aggregate', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                whereClause: {
                    field: 'sms_state',
                    operator: 'eq',
                    value: 'subscribed',
                },
                purchaseDateClause: { operator: 'gt', value: '30d' },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                "gt(shopper.orders(eq(sms_state, 'subscribed') && gt(purchase_date, '30d')), 5)",
            )
        })

        it('puts a unary purchase_date operator inside the aggregate', () => {
            const condition: ConditionState = {
                ...baseAggregateCondition,
                purchaseDateClause: { operator: 'isEmpty', value: null },
            }
            expect(buildFullQuery([condition], schema)).toBe(
                'gt(shopper.orders(isEmpty(purchase_date)), 5)',
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

describe('parseConditionsQuery', () => {
    it('returns DEFAULT_CONDITION for an empty string', () => {
        expect(parseConditionsQuery('', schema)).toEqual([DEFAULT_CONDITION])
    })

    it('returns DEFAULT_CONDITION for a whitespace-only string', () => {
        expect(parseConditionsQuery('   ', schema)).toEqual([DEFAULT_CONDITION])
    })

    it('parses a binary condition with a string value', () => {
        expect(
            parseConditionsQuery("eq(shopper.sms_state, 'subscribed')", schema),
        ).toEqual([
            {
                object: 'shopper',
                field: 'sms_state',
                isAggregate: false,
                operator: 'eq',
                value: 'subscribed',
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('parses a binary condition with a number value', () => {
        expect(
            parseConditionsQuery('gt(shopper.order_count, 5)', schema),
        ).toEqual([
            {
                object: 'shopper',
                field: 'order_count',
                isAggregate: false,
                operator: 'gt',
                value: 5,
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('parses a binary condition with a negative number value', () => {
        expect(
            parseConditionsQuery('gt(shopper.order_count, -3)', schema),
        ).toEqual([
            {
                object: 'shopper',
                field: 'order_count',
                isAggregate: false,
                operator: 'gt',
                value: -3,
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('parses a single-element array value as a plain string', () => {
        expect(
            parseConditionsQuery("containsAny(shopper.tags, ['vip'])", schema),
        ).toEqual([
            {
                object: 'shopper',
                field: 'tags',
                isAggregate: false,
                operator: 'containsAny',
                value: 'vip',
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('parses a multi-element array value as string[]', () => {
        expect(
            parseConditionsQuery(
                "containsAny(shopper.tags, ['vip', 'wholesale', 'new-customer'])",
                schema,
            ),
        ).toEqual([
            {
                object: 'shopper',
                field: 'tags',
                isAggregate: false,
                operator: 'containsAny',
                value: ['vip', 'wholesale', 'new-customer'],
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('parses a unary condition with no value', () => {
        expect(
            parseConditionsQuery('isEmpty(shopper.sms_state)', schema),
        ).toEqual([
            {
                object: 'shopper',
                field: 'sms_state',
                isAggregate: false,
                operator: 'isEmpty',
                value: null,
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('parses multiple conditions joined by &&', () => {
        expect(
            parseConditionsQuery(
                "eq(shopper.sms_state, 'subscribed') && gt(shopper.order_count, 5)",
                schema,
            ),
        ).toEqual([
            {
                object: 'shopper',
                field: 'sms_state',
                isAggregate: false,
                operator: 'eq',
                value: 'subscribed',
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
            {
                object: 'shopper',
                field: 'order_count',
                isAggregate: false,
                operator: 'gt',
                value: 5,
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('parses an aggregate condition with no where content and supports_where — defaults to first field', () => {
        expect(parseConditionsQuery('gt(shopper.orders(), 5)', schema)).toEqual(
            [
                {
                    object: 'shopper',
                    field: 'orders',
                    isAggregate: true,
                    operator: 'gt',
                    value: 5,
                    whereClause: {
                        field: 'sms_state',
                        operator: 'eq',
                        value: null,
                    },
                    purchaseDateClause: null,
                    isWhereVisible: true,
                },
            ],
        )
    })

    it('parses an aggregate condition with a binary where clause', () => {
        expect(
            parseConditionsQuery(
                "gt(shopper.orders(eq(sms_state, 'subscribed')), 5)",
                schema,
            ),
        ).toEqual([
            {
                object: 'shopper',
                field: 'orders',
                isAggregate: true,
                operator: 'gt',
                value: 5,
                whereClause: {
                    field: 'sms_state',
                    operator: 'eq',
                    value: 'subscribed',
                },
                purchaseDateClause: null,
                isWhereVisible: true,
            },
        ])
    })

    it('parses an aggregate condition with a unary where clause', () => {
        expect(
            parseConditionsQuery(
                'gt(shopper.orders(isEmpty(sms_state)), 5)',
                schema,
            ),
        ).toEqual([
            {
                object: 'shopper',
                field: 'orders',
                isAggregate: true,
                operator: 'gt',
                value: 5,
                whereClause: {
                    field: 'sms_state',
                    operator: 'isEmpty',
                    value: null,
                },
                purchaseDateClause: null,
                isWhereVisible: true,
            },
        ])
    })

    it('parses an aggregate condition with non-empty where content that has no outer call syntax — returns null whereClause', () => {
        expect(
            parseConditionsQuery('gt(shopper.orders(invalid), 5)', schema),
        ).toEqual([
            {
                object: 'shopper',
                field: 'orders',
                isAggregate: true,
                operator: 'gt',
                value: 5,
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('parses an aggregate with supports_where false and empty where content — returns null whereClause', () => {
        expect(
            parseConditionsQuery('gt(shopper.orders_count(), 3)', schema),
        ).toEqual([
            {
                object: 'shopper',
                field: 'orders_count',
                isAggregate: true,
                operator: 'gt',
                value: 3,
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('parses an array value with no quoted strings as null', () => {
        expect(
            parseConditionsQuery('containsAny(shopper.tags, [123])', schema),
        ).toEqual([
            {
                object: 'shopper',
                field: 'tags',
                isAggregate: false,
                operator: 'containsAny',
                value: null,
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('returns DEFAULT_CONDITION when the condition string has no operator call syntax', () => {
        expect(parseConditionsQuery('invalid_condition', schema)).toEqual([
            DEFAULT_CONDITION,
        ])
    })

    it('returns DEFAULT_CONDITION when dslRef has no dot separator', () => {
        expect(parseConditionsQuery('gt(nodot, 5)', schema)).toEqual([
            DEFAULT_CONDITION,
        ])
    })

    it('parses a condition with an empty value argument as null', () => {
        expect(parseConditionsQuery('eq(shopper.sms_state, )', schema)).toEqual(
            [
                {
                    object: 'shopper',
                    field: 'sms_state',
                    isAggregate: false,
                    operator: 'eq',
                    value: null,
                    whereClause: null,
                    purchaseDateClause: null,
                    isWhereVisible: false,
                },
            ],
        )
    })

    it('parses a condition with an unrecognized value format as null', () => {
        expect(
            parseConditionsQuery('eq(shopper.sms_state, unquoted)', schema),
        ).toEqual([
            {
                object: 'shopper',
                field: 'sms_state',
                isAggregate: false,
                operator: 'eq',
                value: null,
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('unescapes an apostrophe in a string value', () => {
        expect(
            parseConditionsQuery(
                "eq(shopper.sms_state, 'Women\\'s K1 Flux')",
                schema,
            ),
        ).toEqual([
            {
                object: 'shopper',
                field: 'sms_state',
                isAggregate: false,
                operator: 'eq',
                value: "Women's K1 Flux",
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('unescapes apostrophes in array values', () => {
        expect(
            parseConditionsQuery(
                "containsAny(shopper.tags, ['Women\\'s K1 Flux', 'Men\\'s T-Shirt'])",
                schema,
            ),
        ).toEqual([
            {
                object: 'shopper',
                field: 'tags',
                isAggregate: false,
                operator: 'containsAny',
                value: ["Women's K1 Flux", "Men's T-Shirt"],
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    it('round-trips a value containing an apostrophe', () => {
        const condition: ConditionState = {
            ...baseCondition,
            field: 'tags',
            operator: 'containsAny',
            value: ["Women's K1 Flux"],
        }
        const query = buildFullQuery([condition], schema)
        const parsed = parseConditionsQuery(query, schema)
        expect(parsed[0].value).toBe("Women's K1 Flux")
    })

    it('round-trips a value containing a backslash', () => {
        const condition: ConditionState = {
            ...baseCondition,
            field: 'tags',
            operator: 'containsAny',
            value: ['Summer\\Fall'],
        }
        const query = buildFullQuery([condition], schema)
        const parsed = parseConditionsQuery(query, schema)
        expect(parsed[0].value).toBe('Summer\\Fall')
    })

    it('round-trips a value containing a backslash followed by an apostrophe', () => {
        const condition: ConditionState = {
            ...baseCondition,
            field: 'tags',
            operator: 'containsAny',
            value: ["Women\\'s K1 Flux"],
        }
        const query = buildFullQuery([condition], schema)
        const parsed = parseConditionsQuery(query, schema)
        expect(parsed[0].value).toBe("Women\\'s K1 Flux")
    })

    it('skips unparseable conditions and returns only valid ones', () => {
        expect(
            parseConditionsQuery(
                "invalid && eq(shopper.sms_state, 'active')",
                schema,
            ),
        ).toEqual([
            {
                object: 'shopper',
                field: 'sms_state',
                isAggregate: false,
                operator: 'eq',
                value: 'active',
                whereClause: null,
                purchaseDateClause: null,
                isWhereVisible: false,
            },
        ])
    })

    describe('isWhereVisible', () => {
        it('should be true when the aggregate has a parsed where clause', () => {
            const [condition] = parseConditionsQuery(
                "gt(shopper.orders(eq(sms_state, 'subscribed')), 5)",
                schema,
            )
            expect(condition.isWhereVisible).toBe(true)
        })

        it('should be true when the aggregate defaults to the first field (empty parens, supports_where)', () => {
            const [condition] = parseConditionsQuery(
                'gt(shopper.orders(), 5)',
                schema,
            )
            expect(condition.isWhereVisible).toBe(true)
        })

        it('should be false when the aggregate has no parseable where content', () => {
            const [condition] = parseConditionsQuery(
                'gt(shopper.orders(invalid), 5)',
                schema,
            )
            expect(condition.isWhereVisible).toBe(false)
        })

        it('should be false when the aggregate does not support where', () => {
            const [condition] = parseConditionsQuery(
                'gt(shopper.orders_count(), 3)',
                schema,
            )
            expect(condition.isWhereVisible).toBe(false)
        })

        it('should be false for regular (non-aggregate) conditions', () => {
            const [condition] = parseConditionsQuery(
                "eq(shopper.sms_state, 'subscribed')",
                schema,
            )
            expect(condition.isWhereVisible).toBe(false)
        })

        it('should be false when only a purchase_date clause is inside the aggregate', () => {
            const [condition] = parseConditionsQuery(
                "gt(shopper.orders(gt(purchase_date, '30d')), 5)",
                schema,
            )
            expect(condition.isWhereVisible).toBe(false)
        })
    })

    describe('purchase_date merging', () => {
        it('merges a purchase_date term following an aggregate into purchaseDateClause', () => {
            expect(
                parseConditionsQuery(
                    "gt(shopper.orders(), 5) && gt(shopper.purchase_date, '30d')",
                    schema,
                ),
            ).toEqual([
                {
                    object: 'shopper',
                    field: 'orders',
                    isAggregate: true,
                    operator: 'gt',
                    value: 5,
                    whereClause: {
                        field: 'sms_state',
                        operator: 'eq',
                        value: null,
                    },
                    purchaseDateClause: { operator: 'gt', value: '30d' },
                    isWhereVisible: true,
                },
            ])
        })

        it('merges a 90d purchase_date term correctly', () => {
            expect(
                parseConditionsQuery(
                    "gt(shopper.orders(), 5) && gt(shopper.purchase_date, '90d')",
                    schema,
                ),
            ).toEqual([
                {
                    object: 'shopper',
                    field: 'orders',
                    isAggregate: true,
                    operator: 'gt',
                    value: 5,
                    whereClause: {
                        field: 'sms_state',
                        operator: 'eq',
                        value: null,
                    },
                    purchaseDateClause: { operator: 'gt', value: '90d' },
                    isWhereVisible: true,
                },
            ])
        })

        it('does not merge when the purchase_date object differs from the aggregate object', () => {
            expect(
                parseConditionsQuery(
                    "gt(shopper.orders(), 5) && gt(shopper.sms_state, 'subscribed')",
                    schema,
                ),
            ).toEqual([
                {
                    object: 'shopper',
                    field: 'orders',
                    isAggregate: true,
                    operator: 'gt',
                    value: 5,
                    whereClause: {
                        field: 'sms_state',
                        operator: 'eq',
                        value: null,
                    },
                    purchaseDateClause: null,
                    isWhereVisible: true,
                },
                {
                    object: 'shopper',
                    field: 'sms_state',
                    isAggregate: false,
                    operator: 'gt',
                    value: 'subscribed',
                    whereClause: null,
                    purchaseDateClause: null,
                    isWhereVisible: false,
                },
            ])
        })

        it('does not merge a purchase_date term that is not immediately after an aggregate', () => {
            expect(
                parseConditionsQuery(
                    "eq(shopper.sms_state, 'subscribed') && gt(shopper.purchase_date, '30d')",
                    schema,
                ),
            ).toEqual([
                {
                    object: 'shopper',
                    field: 'sms_state',
                    isAggregate: false,
                    operator: 'eq',
                    value: 'subscribed',
                    whereClause: null,
                    purchaseDateClause: null,
                    isWhereVisible: false,
                },
                {
                    object: 'shopper',
                    field: 'purchase_date',
                    isAggregate: false,
                    operator: 'gt',
                    value: '30d',
                    whereClause: null,
                    purchaseDateClause: null,
                    isWhereVisible: false,
                },
            ])
        })

        it('parses a purchase_date term inside the aggregate (new format)', () => {
            expect(
                parseConditionsQuery(
                    "gt(shopper.orders(gt(purchase_date, '30d')), 5)",
                    schema,
                ),
            ).toEqual([
                {
                    object: 'shopper',
                    field: 'orders',
                    isAggregate: true,
                    operator: 'gt',
                    value: 5,
                    whereClause: null,
                    purchaseDateClause: { operator: 'gt', value: '30d' },
                    isWhereVisible: false,
                },
            ])
        })

        it('parses a where clause and purchase_date both inside the aggregate (new format)', () => {
            expect(
                parseConditionsQuery(
                    "gt(shopper.orders(eq(sms_state, 'subscribed') && gt(purchase_date, '30d')), 5)",
                    schema,
                ),
            ).toEqual([
                {
                    object: 'shopper',
                    field: 'orders',
                    isAggregate: true,
                    operator: 'gt',
                    value: 5,
                    whereClause: {
                        field: 'sms_state',
                        operator: 'eq',
                        value: 'subscribed',
                    },
                    purchaseDateClause: { operator: 'gt', value: '30d' },
                    isWhereVisible: true,
                },
            ])
        })

        it('round-trips an aggregate with a where clause and a purchase_date period', () => {
            const original =
                "gt(shopper.orders(eq(sms_state, 'subscribed') && gt(purchase_date, '365d')), 5)"
            const parsed = parseConditionsQuery(original, schema)
            expect(buildFullQuery(parsed, schema)).toBe(original)
        })
    })
})
