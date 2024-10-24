import {ticketInputFieldDefinition} from 'fixtures/customField'

import {isFieldErrored} from '../isFieldErrored'

describe('isFieldErrored', () => {
    const fieldStateWithValue = {id: 1, value: 'ok'}
    const fieldStateWithoutValue = {
        ...fieldStateWithValue,
        value: undefined,
    }
    const requiredCustomField = {...ticketInputFieldDefinition, required: true}
    it.each([
        [{}, false],
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
    ])('should check if custom field is errored', (params, result) => {
        expect(isFieldErrored(params)).toBe(result)
    })
})
