import type {
    AggregateDef,
    ConditionsSchema,
    FieldDef,
} from '../../types/conditionField'
import {
    buildSections,
    buildSelectId,
    defaultValueForType,
    getFieldDef,
    getOperatorOptions,
    OPERATOR_LABELS,
    parseSelectId,
    toLabel,
} from './conditionField'

const mockSchema: ConditionsSchema = {
    operators: {
        comparison: ['eq', 'neq', 'gt'],
        set: ['containsAny'],
        unary: ['isEmpty'],
    },
    objects: {
        shopper: {
            fields: {
                sms_state: { type: 'string', operators: ['eq', 'neq'] },
                name: { type: 'string', operators: ['eq'] },
            },
            aggregates: {
                order_count: {
                    type: 'number',
                    operators: ['gt', 'lte'],
                    supports_where: true,
                },
            },
        },
    },
}

describe('OPERATOR_LABELS', () => {
    it('should map all expected operator keys to labels', () => {
        expect(OPERATOR_LABELS['eq']).toBe('is')
        expect(OPERATOR_LABELS['neq']).toBe('is not')
        expect(OPERATOR_LABELS['gt']).toBe('greater than')
        expect(OPERATOR_LABELS['gte']).toBe('at least')
        expect(OPERATOR_LABELS['lt']).toBe('less than')
        expect(OPERATOR_LABELS['lte']).toBe('at most')
        expect(OPERATOR_LABELS['contains']).toBe('contains')
        expect(OPERATOR_LABELS['containsAny']).toBe('contains any of')
        expect(OPERATOR_LABELS['containsAll']).toBe('contains all of')
        expect(OPERATOR_LABELS['notContainsAny']).toBe('contains none of')
        expect(OPERATOR_LABELS['isEmpty']).toBe('is empty')
        expect(OPERATOR_LABELS['isNotEmpty']).toBe('is not empty')
    })
})

describe('toLabel', () => {
    it('should replace underscores with spaces and capitalize each word', () => {
        expect(toLabel('sms_state')).toBe('Sms State')
        expect(toLabel('lifetime_value')).toBe('Lifetime Value')
    })

    it('should capitalize a single word with no underscores', () => {
        expect(toLabel('name')).toBe('Name')
    })
})

describe('buildSelectId', () => {
    it('should build an id with "field" when isAggregate is false', () => {
        expect(buildSelectId('shopper', 'sms_state', false)).toBe(
            'shopper:field:sms_state',
        )
    })

    it('should build an id with "aggregate" when isAggregate is true', () => {
        expect(buildSelectId('shopper', 'order_count', true)).toBe(
            'shopper:aggregate:order_count',
        )
    })
})

describe('parseSelectId', () => {
    it('should parse a field id correctly', () => {
        expect(parseSelectId('shopper:field:sms_state')).toEqual({
            object: 'shopper',
            field: 'sms_state',
            isAggregate: false,
        })
    })

    it('should parse an aggregate id and set isAggregate to true', () => {
        expect(parseSelectId('shopper:aggregate:order_count')).toEqual({
            object: 'shopper',
            field: 'order_count',
            isAggregate: true,
        })
    })

    it('should return null when the id does not have exactly 3 parts', () => {
        expect(parseSelectId('shopper:field')).toBeNull()
        expect(parseSelectId('shopper')).toBeNull()
        expect(parseSelectId('shopper:field:sms_state:extra')).toBeNull()
    })
})

describe('getFieldDef', () => {
    it('should return the FieldDef for a known field', () => {
        const result = getFieldDef(mockSchema, 'shopper', 'sms_state', false)
        expect(result).toEqual({ type: 'string', operators: ['eq', 'neq'] })
    })

    it('should return the AggregateDef for a known aggregate', () => {
        const result = getFieldDef(mockSchema, 'shopper', 'order_count', true)
        expect(result).toEqual({
            type: 'number',
            operators: ['gt', 'lte'],
            supports_where: true,
        })
    })

    it('should return null when the object does not exist', () => {
        expect(
            getFieldDef(mockSchema, 'unknown_object', 'sms_state', false),
        ).toBeNull()
    })

    it('should return null when the field does not exist on the object', () => {
        expect(
            getFieldDef(mockSchema, 'shopper', 'unknown_field', false),
        ).toBeNull()
    })

    it('should return null when the aggregate does not exist on the object', () => {
        expect(
            getFieldDef(mockSchema, 'shopper', 'unknown_aggregate', true),
        ).toBeNull()
    })
})

describe('buildSections', () => {
    it('should return sections with the allowed items present in schema', () => {
        const sections = buildSections(mockSchema)
        expect(sections).toEqual([
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

    it('should return an empty array when the section object is not in schema', () => {
        const schemaWithoutShopper: ConditionsSchema = {
            operators: { comparison: [], set: [], unary: [] },
            objects: {},
        }
        expect(buildSections(schemaWithoutShopper)).toEqual([])
    })

    it('should return an empty array when none of the allowed fields exist in schema', () => {
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
    it('should map operators to SelectOptions using OPERATOR_LABELS', () => {
        const fieldDef: FieldDef = { type: 'string', operators: ['eq', 'neq'] }
        expect(getOperatorOptions(fieldDef)).toEqual([
            { id: 'eq', label: 'is' },
            { id: 'neq', label: 'is not' },
        ])
    })

    it('should fall back to the operator key when there is no label for it', () => {
        const fieldDef: FieldDef = {
            type: 'string',
            operators: ['unknown_op'],
        }
        expect(getOperatorOptions(fieldDef)).toEqual([
            { id: 'unknown_op', label: 'unknown_op' },
        ])
    })

    it('should return an empty array when there are no operators', () => {
        const aggregateDef: AggregateDef = {
            type: 'number',
            operators: [],
            supports_where: false,
        }
        expect(getOperatorOptions(aggregateDef)).toEqual([])
    })
})

describe('defaultValueForType', () => {
    it('should return "30d" for datetime type', () => {
        expect(defaultValueForType('datetime')).toBe('30d')
    })

    it('should return null for string type', () => {
        expect(defaultValueForType('string')).toBeNull()
    })

    it('should return null for number type', () => {
        expect(defaultValueForType('number')).toBeNull()
    })

    it('should return null for array_string type', () => {
        expect(defaultValueForType('array_string')).toBeNull()
    })

    it('should return null for boolean type', () => {
        expect(defaultValueForType('boolean')).toBeNull()
    })
})
