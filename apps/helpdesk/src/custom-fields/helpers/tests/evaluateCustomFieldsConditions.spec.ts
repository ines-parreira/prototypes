import { renderHook } from '@repo/testing'

import {
    CustomFieldCondition,
    ExpressionFieldSource,
    ExpressionFieldType,
    ExpressionOperator,
    TicketStatus,
} from '@gorgias/helpdesk-types'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { customFieldCondition } from 'fixtures/customFieldCondition'

import { evaluateCustomFieldsConditions } from '../evaluateCustomFieldsConditions'

const requiredWhenOpenCustomFieldCondition = {
    ...customFieldCondition,
    name: 'Required when open',
    id: 1,
    expression: [
        {
            field: 'status',
            operator: ExpressionOperator.Is,
            values: ['open'],
            field_source: ExpressionFieldSource.Ticket,
        },
    ],
    requirements: [
        {
            field_id: 500,
            type: ExpressionFieldType.Required,
        },
    ],
}
const visibleWhenAnotherFieldSetCustomFieldCondition = {
    ...customFieldCondition,
    name: 'Visible when open',
    id: 2,
    expression: [
        {
            field: 100,
            operator: ExpressionOperator.IsOneOf,
            values: ['high'],
            field_source: ExpressionFieldSource.TicketCustomFields,
        },
    ],
    requirements: [
        {
            field_id: 501,
            type: ExpressionFieldType.Visible,
        },
    ],
}

describe('evaluateCustomFieldsConditions', () => {
    it('returns one field as required and another one as visible as all conditions are met', () => {
        const result = evaluateCustomFieldsConditions(
            [
                requiredWhenOpenCustomFieldCondition,
                visibleWhenAnotherFieldSetCustomFieldCondition,
            ],
            OBJECT_TYPES.TICKET,
            {
                status: TicketStatus.Open,
                custom_fields: { 100: { value: 'high' } },
            },
        )

        expect(result).toEqual({
            500: ExpressionFieldType.Required,
            501: ExpressionFieldType.Visible,
        })
    })

    it('returns only one required field, as second condition is not met', () => {
        const result = evaluateCustomFieldsConditions(
            [
                requiredWhenOpenCustomFieldCondition,
                visibleWhenAnotherFieldSetCustomFieldCondition,
            ],
            OBJECT_TYPES.TICKET,
            {
                status: TicketStatus.Open,
                custom_fields: {},
            },
        )

        expect(result).toEqual({ 500: ExpressionFieldType.Required })
    })

    it('returns only one visible field, as the condition for required is not met', () => {
        const result = evaluateCustomFieldsConditions(
            [
                requiredWhenOpenCustomFieldCondition,
                visibleWhenAnotherFieldSetCustomFieldCondition,
            ],
            OBJECT_TYPES.TICKET,
            {
                status: TicketStatus.Closed,
                custom_fields: { 100: { value: 'high' } },
            },
        )

        expect(result).toEqual({ 501: ExpressionFieldType.Visible })
    })

    it.each([
        Array([
            visibleWhenAnotherFieldSetCustomFieldCondition,
            {
                ...requiredWhenOpenCustomFieldCondition,
                requirements: [
                    {
                        field_id: 500,
                        type: ExpressionFieldType.Required,
                    },
                    {
                        field_id: 501,
                        type: ExpressionFieldType.Required,
                    },
                ],
            },
        ]),
        Array([
            {
                ...requiredWhenOpenCustomFieldCondition,
                requirements: [
                    {
                        field_id: 500,
                        type: ExpressionFieldType.Required,
                    },
                    {
                        field_id: 501,
                        type: ExpressionFieldType.Required,
                    },
                ],
            },
            visibleWhenAnotherFieldSetCustomFieldCondition,
        ]),
    ])(
        'prioritizes the "required" conditional requirement over "visible" when conditions overlap',
        (conditions: CustomFieldCondition[]) => {
            const result = evaluateCustomFieldsConditions(
                conditions,
                OBJECT_TYPES.TICKET,
                {
                    status: TicketStatus.Open,
                    custom_fields: { 100: { value: 'high' } },
                },
            )

            expect(result).toEqual({
                500: ExpressionFieldType.Required,
                501: ExpressionFieldType.Required,
            })
        },
    )

    it('supports only ticket for now', () => {
        expect(() =>
            renderHook(() =>
                evaluateCustomFieldsConditions([], OBJECT_TYPES.CUSTOMER, {}),
            ),
        ).toThrow('Unsupported object type: Customer')
    })

    it.each([
        // is empty
        [ExpressionOperator.IsEmpty, undefined, '', true],
        [ExpressionOperator.IsEmpty, undefined, [], true],
        [ExpressionOperator.IsEmpty, undefined, null, true],
        [ExpressionOperator.IsEmpty, undefined, 'test', false],
        [ExpressionOperator.IsEmpty, undefined, 123, false],
        [ExpressionOperator.IsEmpty, undefined, [123], false],

        // is not empty
        [ExpressionOperator.IsNotEmpty, undefined, '', false],
        [ExpressionOperator.IsNotEmpty, undefined, [], false],
        [ExpressionOperator.IsNotEmpty, undefined, null, false],
        [ExpressionOperator.IsNotEmpty, undefined, 'test', true],
        [ExpressionOperator.IsNotEmpty, undefined, 123, true],
        [ExpressionOperator.IsNotEmpty, undefined, [123], true],

        // is
        [ExpressionOperator.Is, ['test'], 'test', true],
        [ExpressionOperator.Is, ['test'], 'no', false],
        [ExpressionOperator.Is, ['test'], 456, false],
        [ExpressionOperator.Is, ['test'], null, false],
        [ExpressionOperator.Is, [123], 123, true],
        [ExpressionOperator.Is, [123], 456, false],
        [ExpressionOperator.Is, [123], 'no', false],
        [ExpressionOperator.Is, [true], true, true],
        [ExpressionOperator.Is, [true], false, false],
        [ExpressionOperator.Is, [true], 'no', false],

        // is not
        [ExpressionOperator.IsNot, ['test'], 'test', false],
        [ExpressionOperator.IsNot, ['test'], 'no', true],
        [ExpressionOperator.IsNot, ['test'], 456, true],
        [ExpressionOperator.IsNot, ['test'], null, true],

        // greater_or_equal_to
        [ExpressionOperator.GreaterOrEqualTo, [300], 456, true],
        [ExpressionOperator.GreaterOrEqualTo, [300], 300, true],
        [ExpressionOperator.GreaterOrEqualTo, [300], 123, false],
        [ExpressionOperator.GreaterOrEqualTo, [300], null, false],

        // less_or_equal_to
        [ExpressionOperator.LessOrEqualTo, [300], 456, false],
        [ExpressionOperator.LessOrEqualTo, [300], 300, true],
        [ExpressionOperator.LessOrEqualTo, [300], 123, true],
        [ExpressionOperator.LessOrEqualTo, [300], null, false],

        // is_one_of
        [ExpressionOperator.IsOneOf, ['yes', 'test'], 'test', true],
        [ExpressionOperator.IsOneOf, ['yes', 'test'], 'no', false],
        [ExpressionOperator.IsOneOf, ['yes', 'test'], 456, false],
        [ExpressionOperator.IsOneOf, ['yes', 'test'], null, false],

        // is_not_one_of
        [ExpressionOperator.IsNotOneOf, ['yes', 'test'], 'test', false],
        [ExpressionOperator.IsNotOneOf, ['yes', 'test'], 'no', true],
        [ExpressionOperator.IsNotOneOf, ['yes', 'test'], 456, true],
        [ExpressionOperator.IsNotOneOf, ['yes', 'test'], null, true],
    ])(
        'should evaluate operator %s correctly. Expression value: %s. Current value: %s',
        (operator, expressionValues, currentFieldValue, expectedResult) => {
            const conditions = [
                {
                    ...customFieldCondition,
                    id: 1,
                    expression: [
                        {
                            field: 1,
                            operator,
                            values: expressionValues,
                            field_source:
                                ExpressionFieldSource.TicketCustomFields,
                        },
                    ],
                    requirements: [
                        {
                            field_id: 2,
                            type: ExpressionFieldType.Required,
                        },
                    ],
                },
            ]

            const sourceObject = {
                custom_fields: {
                    1: { value: currentFieldValue },
                },
            }

            const result = evaluateCustomFieldsConditions(
                conditions,
                OBJECT_TYPES.TICKET,
                sourceObject,
            )

            if (expectedResult) {
                expect(result).toEqual({
                    2: ExpressionFieldType.Required,
                })
            } else {
                expect(result).toEqual({})
            }
        },
    )
})
