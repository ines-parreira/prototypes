import type {
    AggregateDef,
    ConditionsSchema,
    FieldDef,
} from '../../types/conditionField'
import {
    buildSections,
    buildSelectId,
    defaultValueForField,
    defaultValueForType,
    EXISTENCE_OBJECTS,
    getFieldDef,
    getOperatorOptions,
    isExistenceCondition,
    isExistenceObject,
    OPERATOR_LABELS,
    parseSelectId,
    toLabel,
    WHERE_FIELD_ALLOWLIST,
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
                sms_consent_status: {
                    type: 'string',
                    operators: ['eq', 'neq'],
                },
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
        expect(OPERATOR_LABELS['gt']).toBe('is greater than')
        expect(OPERATOR_LABELS['gte']).toBe('is at least')
        expect(OPERATOR_LABELS['lt']).toBe('is less than')
        expect(OPERATOR_LABELS['lte']).toBe('is at most')
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
        expect(toLabel('sms_consent_status')).toBe('Sms Consent Status')
        expect(toLabel('lifetime_value')).toBe('Lifetime Value')
    })

    it('should capitalize a single word with no underscores', () => {
        expect(toLabel('name')).toBe('Name')
    })
})

describe('buildSelectId', () => {
    it('should build an id with "field" when isAggregate is false', () => {
        expect(buildSelectId('shopper', 'sms_consent_status', false)).toBe(
            'shopper:field:sms_consent_status',
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
        expect(parseSelectId('shopper:field:sms_consent_status')).toEqual({
            object: 'shopper',
            field: 'sms_consent_status',
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
        expect(
            parseSelectId('shopper:field:sms_consent_status:extra'),
        ).toBeNull()
    })
})

describe('getFieldDef', () => {
    it('should return the FieldDef for a known field', () => {
        const result = getFieldDef(
            mockSchema,
            'shopper',
            'sms_consent_status',
            false,
        )
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
            getFieldDef(
                mockSchema,
                'unknown_object',
                'sms_consent_status',
                false,
            ),
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
                        id: 'shopper:field:sms_consent_status',
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
        const schemaWithoutSmsConsentStatus: ConditionsSchema = {
            operators: { comparison: [], set: [], unary: [] },
            objects: {
                shopper: {
                    fields: {},
                },
            },
        }
        expect(buildSections(schemaWithoutSmsConsentStatus)).toEqual([])
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

describe('defaultValueForField', () => {
    it('should return "subscribed" for sms_consent_status regardless of type', () => {
        expect(defaultValueForField('sms_consent_status', 'string')).toBe(
            'subscribed',
        )
    })

    it('should fall back to "30d" for unknown datetime fields', () => {
        expect(defaultValueForField('some_date', 'datetime')).toBe('30d')
    })

    it('should fall back to null for unknown string fields', () => {
        expect(defaultValueForField('name', 'string')).toBeNull()
    })

    it('should fall back to null for unknown number fields', () => {
        expect(defaultValueForField('order_count', 'number')).toBeNull()
    })
})

describe('EXISTENCE_OBJECTS', () => {
    it('should contain last_cart and last_order', () => {
        expect(EXISTENCE_OBJECTS).toContain('last_cart')
        expect(EXISTENCE_OBJECTS).toContain('last_order')
    })

    it('should contain exactly two entries', () => {
        expect(EXISTENCE_OBJECTS).toHaveLength(2)
    })
})

describe('WHERE_FIELD_ALLOWLIST', () => {
    it('should contain product_variant_ids with label Product name', () => {
        expect(
            WHERE_FIELD_ALLOWLIST.find((e) => e.field === 'product_variant_ids')
                ?.label,
        ).toBe('Product name')
    })

    it('should contain product_tags with label Product tag', () => {
        expect(
            WHERE_FIELD_ALLOWLIST.find((e) => e.field === 'product_tags')
                ?.label,
        ).toBe('Product tag')
    })

    it('should contain product_collection_ids with label Collection', () => {
        expect(
            WHERE_FIELD_ALLOWLIST.find(
                (e) => e.field === 'product_collection_ids',
            )?.label,
        ).toBe('Collection')
    })

    it('should contain exactly three entries', () => {
        expect(WHERE_FIELD_ALLOWLIST).toHaveLength(3)
    })
})

describe('isExistenceObject', () => {
    it('should return true for last_cart', () => {
        expect(isExistenceObject('last_cart')).toBe(true)
    })

    it('should return true for last_order', () => {
        expect(isExistenceObject('last_order')).toBe(true)
    })

    it('should return false for shopper', () => {
        expect(isExistenceObject('shopper')).toBe(false)
    })

    it('should return false for orders', () => {
        expect(isExistenceObject('orders')).toBe(false)
    })

    it('should return false for an empty string', () => {
        expect(isExistenceObject('')).toBe(false)
    })
})

describe('isExistenceCondition', () => {
    it('should return true when object is last_order and field equals object', () => {
        expect(isExistenceCondition('last_order', 'last_order')).toBe(true)
    })

    it('should return true when object is last_cart and field equals object', () => {
        expect(isExistenceCondition('last_cart', 'last_cart')).toBe(true)
    })

    it('should return false when object is an existence object but field is different', () => {
        expect(isExistenceCondition('last_order', 'amount')).toBe(false)
    })

    it('should return false when object is not an existence object even if field matches', () => {
        expect(isExistenceCondition('shopper', 'shopper')).toBe(false)
    })
})

const schemaWithExistenceObjects: ConditionsSchema = {
    operators: { comparison: [], set: [], unary: [] },
    objects: {
        orders: {
            fields: {},
            aggregates: {
                count: {
                    type: 'number',
                    operators: ['eq'],
                    supports_where: true,
                },
            },
        },
        last_order: {
            fields: {
                product_variant_ids: {
                    type: 'array_string',
                    operators: ['eq'],
                },
            },
            aggregates: {},
        },
        last_cart: {
            fields: {
                product_variant_ids: {
                    type: 'array_string',
                    operators: ['eq'],
                },
            },
            aggregates: {},
        },
    },
}

describe('getFieldDef (existence conditions)', () => {
    it('should return a FieldDef with only isNotEmpty operator for the last_order sentinel', () => {
        expect(
            getFieldDef(
                schemaWithExistenceObjects,
                'last_order',
                'last_order',
                false,
            ),
        ).toEqual({ type: 'string', operators: ['isNotEmpty'] })
    })

    it('should return a FieldDef with only isNotEmpty operator for the last_cart sentinel', () => {
        expect(
            getFieldDef(
                schemaWithExistenceObjects,
                'last_cart',
                'last_cart',
                false,
            ),
        ).toEqual({ type: 'string', operators: ['isNotEmpty'] })
    })

    it('should return null when the existence object is not present in the schema', () => {
        const emptySchema: ConditionsSchema = {
            operators: { comparison: [], set: [], unary: [] },
            objects: {},
        }
        expect(
            getFieldDef(emptySchema, 'last_order', 'last_order', false),
        ).toBeNull()
    })

    it('should still return the regular field when field differs from object on an existence object', () => {
        expect(
            getFieldDef(
                schemaWithExistenceObjects,
                'last_order',
                'product_variant_ids',
                false,
            ),
        ).toEqual({ type: 'array_string', operators: ['eq'] })
    })
})

describe('buildSections (existence conditions)', () => {
    it('should include Last Cart and Last Order items in the orders section', () => {
        const sections = buildSections(schemaWithExistenceObjects)
        const ordersSection = sections.find((s) => s.id === 'orders')
        expect(ordersSection).toBeDefined()
        expect(ordersSection?.items).toContainEqual({
            id: 'last_cart:field:last_cart',
            label: 'Last Cart',
        })
        expect(ordersSection?.items).toContainEqual({
            id: 'last_order:field:last_order',
            label: 'Last Order',
        })
    })

    it('should use field === object as the select id for existence items', () => {
        const sections = buildSections(schemaWithExistenceObjects)
        const ordersSection = sections.find((s) => s.id === 'orders')
        expect(
            ordersSection?.items.find((i) => i.label === 'Last Order')?.id,
        ).toBe('last_order:field:last_order')
        expect(
            ordersSection?.items.find((i) => i.label === 'Last Cart')?.id,
        ).toBe('last_cart:field:last_cart')
    })

    it('should exclude existence items when their schema objects are absent', () => {
        const schemaWithoutExistence: ConditionsSchema = {
            operators: { comparison: [], set: [], unary: [] },
            objects: {
                orders: {
                    fields: {},
                    aggregates: {
                        count: {
                            type: 'number',
                            operators: ['eq'],
                            supports_where: true,
                        },
                    },
                },
            },
        }
        const sections = buildSections(schemaWithoutExistence)
        const ordersSection = sections.find((s) => s.id === 'orders')
        const ids = ordersSection?.items.map((i) => i.id) ?? []
        expect(ids).not.toContain('last_cart:field:last_cart')
        expect(ids).not.toContain('last_order:field:last_order')
    })

    it('should keep non-existence items alongside existence items in the same section', () => {
        const sections = buildSections(schemaWithExistenceObjects)
        const ordersSection = sections.find((s) => s.id === 'orders')
        expect(
            ordersSection?.items.find((i) => i.id === 'orders:aggregate:count'),
        ).toBeDefined()
    })
})
