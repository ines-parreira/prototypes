import {RequirementType, ExpressionFieldType} from '@gorgias/api-types'

import {ticketInputFieldDefinition} from 'fixtures/customField'

import {isFieldErrored} from '../isFieldErrored'

describe('isFieldErrored', () => {
    const fieldStateWithValue = {id: 1, value: 'ok'}
    const fieldStateWithoutValue = {
        ...fieldStateWithValue,
        value: undefined,
    }
    const requiredCustomField = {...ticketInputFieldDefinition, required: true}
    const conditionalCustomField = {
        ...ticketInputFieldDefinition,
        id: 100,
        required: false,
        requirement_type: RequirementType.Conditional,
    }

    it.each([
        [
            {
                fieldDefinition: ticketInputFieldDefinition,
            },
            false,
        ],
        [
            {
                fieldState: fieldStateWithValue,
                fieldDefinition: ticketInputFieldDefinition,
            },
            false,
        ],
        [
            {
                fieldState: fieldStateWithValue,
                fieldDefinition: requiredCustomField,
            },
            false,
        ],
        [
            {
                fieldState: fieldStateWithoutValue,
                fieldDefinition: ticketInputFieldDefinition,
            },
            false,
        ],
        [
            {
                fieldState: fieldStateWithoutValue,
                fieldDefinition: requiredCustomField,
            },
            true,
        ],
        [
            {
                fieldState: fieldStateWithoutValue,
                fieldDefinition: conditionalCustomField,
                conditionalRequirementType: ExpressionFieldType.Required,
            },
            true,
        ],
        [
            {
                fieldState: fieldStateWithValue,
                fieldDefinition: conditionalCustomField,
                conditionalRequirementType: ExpressionFieldType.Required,
            },
            false,
        ],
        [
            {
                fieldState: fieldStateWithoutValue,
                fieldDefinition: conditionalCustomField,
                conditionalRequirementType: ExpressionFieldType.Visible,
            },
            false,
        ],
        [
            {
                fieldState: fieldStateWithValue,
                fieldDefinition: conditionalCustomField,
                conditionalRequirementType: ExpressionFieldType.Visible,
            },
            false,
        ],
    ])('should check if custom field is errored', (params, result) => {
        expect(isFieldErrored(params)).toBe(result)
    })
})
