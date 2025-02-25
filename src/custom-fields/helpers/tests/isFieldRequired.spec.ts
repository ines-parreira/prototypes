import { ExpressionFieldType, RequirementType } from '@gorgias/api-types'

import { ticketInputFieldDefinition } from 'fixtures/customField'

import { isFieldRequired } from '../isFieldRequired'

describe('isFieldRequired', () => {
    const requiredCustomField = {
        ...ticketInputFieldDefinition,
        required: true,
    }
    const conditionalCustomField = {
        ...ticketInputFieldDefinition,
        id: 100,
        required: false,
        requirement_type: RequirementType.Conditional,
    }
    const optionalCustomField = {
        ...ticketInputFieldDefinition,
        required: false,
        requirement_type: RequirementType.Visible,
    }

    it.each([
        // Field is required explicitly
        [
            {
                fieldDefinition: requiredCustomField,
                conditionalRequirementType: undefined,
            },
            true,
        ],
        // Field is not required explicitly
        [
            {
                fieldDefinition: optionalCustomField,
                conditionalRequirementType: undefined,
            },
            false,
        ],
        // Conditional field with required conditional type
        [
            {
                fieldDefinition: conditionalCustomField,
                conditionalRequirementType: ExpressionFieldType.Required,
            },
            true,
        ],
        // Conditional field with non-required conditional type
        [
            {
                fieldDefinition: conditionalCustomField,
                conditionalRequirementType: ExpressionFieldType.Visible,
            },
            false,
        ],
        // Conditional field with undefined conditional type
        [
            {
                fieldDefinition: conditionalCustomField,
                conditionalRequirementType: undefined,
            },
            false,
        ],
    ])(
        'should determine if the custom field is required',
        (params, expected) => {
            expect(
                isFieldRequired(
                    params.fieldDefinition,
                    params.conditionalRequirementType,
                ),
            ).toBe(expected)
        },
    )
})
