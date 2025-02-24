import {Macro} from '@gorgias/api-queries'

import {RequirementType} from '@gorgias/api-types'

import {ticketInputFieldDefinition} from 'fixtures/customField'
import {macroFixture, setCustomFieldValueAction} from 'fixtures/macro'

import {
    getInvalidTicketFieldIds,
    mergeFieldsStateWithMacroValues,
} from '../customFields'

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
            getInvalidTicketFieldIds({
                fieldsState,
                fieldDefinitions,
                evaluatedConditions: {},
            })
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
            {
                ...ticketInputFieldDefinition,
                id: 3,
                required: false,
                requirement_type: RequirementType.Conditional,
            },
        ]
        expect(
            getInvalidTicketFieldIds({
                fieldsState,
                fieldDefinitions,
                evaluatedConditions: {},
            })
        ).toEqual([2])
    })
})

describe('mergeFieldsStateWithMacroValues', () => {
    it('should return a fields state where macro action values, related to field values, replace their respective field value', () => {
        const fieldsState = {
            1: {id: 1, value: 'ok'},
            2: {id: 2, value: 'ok'},
        }
        const appliedMacro: Macro = {
            ...macroFixture,
            actions: [
                setCustomFieldValueAction,
                // the action below should not be taken into account
                // because it is empty
                {
                    ...setCustomFieldValueAction,
                    arguments: {
                        custom_field_id: 2,
                        value: '',
                    },
                },
            ],
        }
        expect(
            mergeFieldsStateWithMacroValues({fieldsState, appliedMacro})
        ).toEqual({
            1: {id: 1, value: setCustomFieldValueAction.arguments.value},
            2: {id: 2, value: 'ok'},
        })
    })
})
