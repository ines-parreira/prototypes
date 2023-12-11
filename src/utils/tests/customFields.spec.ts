import {ticketInputFieldDefinition} from 'fixtures/customField'
import {
    isCustomFieldValueEmpty,
    isFieldErrored,
    getInvalidTicketFieldIds,
} from '../customFields'

describe('isCustomFieldValueEmpty', () => {
    it.each([
        ['', true],
        [undefined, true],
        [' ', false],
        ['a', false],
        [0, false],
        [1, false],
    ])('should check if custom field value is empty', (input, result) => {
        expect(isCustomFieldValueEmpty(input)).toBe(result)
    })
})

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

describe('getInvalidTicketFieldIds', () => {
    it('should return empty array if no fields are invalid', () => {
        const fieldsState = {
            1: {id: 1, value: 'ok'},
            2: {id: 2, value: 'ok'},
        }
        const fieldDefinitions = [
            ticketInputFieldDefinition,
            {...ticketInputFieldDefinition, id: 2},
        ]
        expect(
            getInvalidTicketFieldIds({fieldsState, fieldDefinitions})
        ).toEqual([])
    })
    it('should return an array of invalid field ids', () => {
        const fieldsState = {
            1: {id: 1, value: 'ok'},
            2: {id: 2, value: undefined},
        }
        const fieldDefinitions = [
            ticketInputFieldDefinition,
            {...ticketInputFieldDefinition, id: 2, required: true},
        ]
        expect(
            getInvalidTicketFieldIds({fieldsState, fieldDefinitions})
        ).toEqual([2])
    })
})
