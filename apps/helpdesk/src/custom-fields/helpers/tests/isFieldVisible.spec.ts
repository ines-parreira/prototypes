import { ExpressionFieldType, RequirementType } from '@gorgias/helpdesk-types'

import { ticketInputFieldDefinition } from 'fixtures/customField'

import { isFieldVisible } from '../isFieldVisible'

describe('isFieldVisible', () => {
    const requiredCustomField = {
        ...ticketInputFieldDefinition,
        required: true,
    }
    const conditionalVisibleCustomField = {
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
        [
            {
                fieldDefinition: requiredCustomField,
                conditionalRequirementType: undefined,
            },
            false,
        ],
        [
            {
                fieldDefinition: optionalCustomField,
                conditionalRequirementType: undefined,
            },
            true,
        ],
        [
            {
                fieldDefinition: conditionalVisibleCustomField,
                conditionalRequirementType: ExpressionFieldType.Visible,
            },
            true,
        ],
        [
            {
                fieldDefinition: conditionalVisibleCustomField,
                conditionalRequirementType: ExpressionFieldType.Required,
            },
            false,
        ],
        [
            {
                fieldDefinition: conditionalVisibleCustomField,
                conditionalRequirementType: undefined,
            },
            false,
        ],
    ])(
        'should determine if the custom field is visible',
        (params, expected) => {
            expect(
                isFieldVisible(
                    params.fieldDefinition,
                    params.conditionalRequirementType,
                ),
            ).toBe(expected)
        },
    )
})
