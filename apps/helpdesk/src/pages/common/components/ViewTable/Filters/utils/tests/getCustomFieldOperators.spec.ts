import { fromJS } from 'immutable'

import { BASIC_OPERATORS } from 'config'
import { CustomFieldTreePath } from 'models/rule/types'

import getCustomFieldOperators from '../getCustomFieldOperators'
import { mockCustomField, mockSchemas } from './mocks'

describe('getCustomFieldOperators', () => {
    it('should return basic operators if no custom field is provided or no field schema exists', () => {
        expect(getCustomFieldOperators(fromJS({ definitions: {} }))).toEqual(
            BASIC_OPERATORS,
        )
    })

    it('should provide the operators for a custom field', () => {
        expect(getCustomFieldOperators(mockSchemas, mockCustomField)).toEqual({
            eq: {
                label: 'is',
            },
        })
    })

    it('should use custom schema path when provided', () => {
        const customerSchemas = fromJS({
            definitions: {
                Ticket: {
                    properties: {
                        customer: {
                            $ref: '#/definitions/Customer',
                        },
                    },
                },
                Customer: {
                    properties: {
                        custom_fields: {
                            meta: {
                                operators: {
                                    text: {
                                        eq: { label: 'is' },
                                        neq: { label: 'is not' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        expect(
            getCustomFieldOperators(
                customerSchemas,
                mockCustomField,
                CustomFieldTreePath.Customer,
            ),
        ).toEqual({
            eq: { label: 'is' },
            neq: { label: 'is not' },
        })
    })

    it('should fallback to BASIC_OPERATORS when custom schema path does not exist', () => {
        const emptySchemas = fromJS({ definitions: {} })

        expect(
            getCustomFieldOperators(
                emptySchemas,
                mockCustomField,
                CustomFieldTreePath.Customer,
            ),
        ).toEqual(BASIC_OPERATORS)
    })

    it('should fallback to BASIC_OPERATORS when custom field schema exists but no operators for field type', () => {
        const schemasWithoutOperators = fromJS({
            definitions: {
                Ticket: {
                    properties: {
                        customer: {
                            $ref: '#/definitions/Customer',
                        },
                    },
                },
                Customer: {
                    properties: {
                        custom_fields: {
                            meta: {},
                        },
                    },
                },
            },
        })

        expect(
            getCustomFieldOperators(
                schemasWithoutOperators,
                mockCustomField,
                CustomFieldTreePath.Customer,
            ),
        ).toEqual(BASIC_OPERATORS)
    })
})
