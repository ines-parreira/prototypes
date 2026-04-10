import type { ConditionsSchema, FieldDef } from '../../types/conditionField'
import {
    buildSections,
    buildSelectId,
    defaultValueForType,
    getFieldDef,
    getOperatorOptions,
    parseSelectId,
    toLabel,
} from './conditionField'

const schema: ConditionsSchema = {
    operators: {
        comparison: ['eq', 'neq', 'gt'],
        set: ['containsAny'],
        unary: ['isEmpty', 'isNotEmpty'],
    },
    objects: {
        shopper: {
            fields: {
                sms_state: { type: 'string', operators: ['eq', 'isEmpty'] },
                order_count: { type: 'number', operators: ['gt'] },
            },
            aggregates: {
                total_spent: {
                    type: 'number',
                    operators: ['gt'],
                    supports_where: false,
                },
            },
        },
    },
}

describe('toLabel', () => {
    it('converts underscore-separated words to Title Case', () => {
        expect(toLabel('sms_state')).toBe('Sms State')
    })

    it('converts multi-word underscore names', () => {
        expect(toLabel('order_count')).toBe('Order Count')
    })

    it('handles a single word with no underscores', () => {
        expect(toLabel('total')).toBe('Total')
    })
})

describe('buildSelectId', () => {
    it('builds an id for a regular field', () => {
        expect(buildSelectId('shopper', 'sms_state', false)).toBe(
            'shopper:field:sms_state',
        )
    })

    it('builds an id for an aggregate field', () => {
        expect(buildSelectId('shopper', 'total_spent', true)).toBe(
            'shopper:aggregate:total_spent',
        )
    })
})

describe('parseSelectId', () => {
    it('parses a regular field id', () => {
        expect(parseSelectId('shopper:field:sms_state')).toEqual({
            object: 'shopper',
            field: 'sms_state',
            isAggregate: false,
        })
    })

    it('parses an aggregate field id', () => {
        expect(parseSelectId('shopper:aggregate:total_spent')).toEqual({
            object: 'shopper',
            field: 'total_spent',
            isAggregate: true,
        })
    })

    it('returns null when the id has fewer than 3 parts', () => {
        expect(parseSelectId('shopper:field')).toBeNull()
    })

    it('returns null when the id has more than 3 parts', () => {
        expect(parseSelectId('shopper:field:sms_state:extra')).toBeNull()
    })

    it('returns null for a single-segment string', () => {
        expect(parseSelectId('invalid')).toBeNull()
    })
})

describe('getFieldDef', () => {
    it('returns the field definition for a regular field', () => {
        expect(getFieldDef(schema, 'shopper', 'sms_state', false)).toEqual({
            type: 'string',
            operators: ['eq', 'isEmpty'],
        })
    })

    it('returns the aggregate definition when isAggregate is true', () => {
        expect(getFieldDef(schema, 'shopper', 'total_spent', true)).toEqual({
            type: 'number',
            operators: ['gt'],
            supports_where: false,
        })
    })

    it('returns null when the object does not exist in the schema', () => {
        expect(
            getFieldDef(schema, 'unknown_object', 'sms_state', false),
        ).toBeNull()
    })

    it('returns null when the field does not exist in the object', () => {
        expect(
            getFieldDef(schema, 'shopper', 'nonexistent_field', false),
        ).toBeNull()
    })

    it('returns null when the aggregate does not exist in the object', () => {
        expect(
            getFieldDef(schema, 'shopper', 'nonexistent_aggregate', true),
        ).toBeNull()
    })
})

describe('buildSections', () => {
    it('returns a section with the allowed items when the schema has the required fields', () => {
        expect(buildSections(schema)).toEqual([
            {
                id: 'shopper',
                name: 'Shopper characteristics',
                items: [
                    {
                        id: 'shopper:field:sms_state',
                        label: 'SMS subscription status',
                    },
                ],
            },
        ])
    })

    it('returns an empty array when the allowlisted object does not exist in the schema', () => {
        const emptySchema: ConditionsSchema = {
            operators: { comparison: [], set: [], unary: [] },
            objects: {},
        }
        expect(buildSections(emptySchema)).toEqual([])
    })

    it('returns an empty array when the allowlisted field is not in the object definition', () => {
        const schemaWithoutSmsState: ConditionsSchema = {
            operators: { comparison: [], set: [], unary: [] },
            objects: {
                shopper: {
                    fields: {},
                },
            },
        }
        expect(buildSections(schemaWithoutSmsState)).toEqual([])
    })
})

describe('getOperatorOptions', () => {
    it('returns options with labels from OPERATOR_LABELS', () => {
        const fieldDef: FieldDef = {
            type: 'string',
            operators: ['eq', 'neq', 'isEmpty'],
        }
        expect(getOperatorOptions(fieldDef)).toEqual([
            { id: 'eq', label: 'is' },
            { id: 'neq', label: 'is not' },
            { id: 'isEmpty', label: 'is empty' },
        ])
    })

    it('falls back to the raw operator string when it has no label mapping', () => {
        const fieldDef: FieldDef = {
            type: 'string',
            operators: ['unknownOp'],
        }
        expect(getOperatorOptions(fieldDef)).toEqual([
            { id: 'unknownOp', label: 'unknownOp' },
        ])
    })
})

describe('defaultValueForType', () => {
    it('returns "30d" for datetime type', () => {
        expect(defaultValueForType('datetime')).toBe('30d')
    })

    it('returns null for string type', () => {
        expect(defaultValueForType('string')).toBeNull()
    })

    it('returns null for number type', () => {
        expect(defaultValueForType('number')).toBeNull()
    })

    it('returns null for array_string type', () => {
        expect(defaultValueForType('array_string')).toBeNull()
    })

    it('returns null for boolean type', () => {
        expect(defaultValueForType('boolean')).toBeNull()
    })
})
