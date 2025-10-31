import { Macro } from '@gorgias/helpdesk-queries'
import { RequirementType } from '@gorgias/helpdesk-types'

import { ticketInputFieldDefinition } from 'fixtures/customField'
import {
    macroFixture,
    setCustomerCustomFieldValueAction,
    setCustomFieldValueAction,
} from 'fixtures/macro'

import {
    getInvalidTicketFieldIds,
    mergeCustomerFieldsStateWithMacroValues,
    mergeFieldsStateWithMacroValues,
} from '../customFields'

describe('getInvalidTicketFieldIds', () => {
    it('should return empty array if no fields are invalid', () => {
        const fieldsState = {
            1: { id: 1, value: 'ok' },
            2: { id: 2, value: 'ok' },
        }
        const fieldDefinitions = [
            ticketInputFieldDefinition,
            { ...ticketInputFieldDefinition, id: 2 },
        ]
        expect(
            getInvalidTicketFieldIds({
                fieldsState,
                fieldDefinitions,
                evaluatedConditions: {},
            }),
        ).toEqual([])
    })

    it('should return an array of invalid field ids', () => {
        const fieldsState = {
            1: { id: 1, value: 'ok' },
            2: { id: 2, value: undefined },
        }
        const fieldDefinitions = [
            ticketInputFieldDefinition,
            { ...ticketInputFieldDefinition, id: 2, required: true },
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
            }),
        ).toEqual([2])
    })
})

describe('mergeFieldsStateWithMacroValues', () => {
    it('should return a fields state where macro action values, related to field values, replace their respective field value', () => {
        const fieldsState = {
            1: { id: 1, value: 'ok' },
            2: { id: 2, value: 'ok' },
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
            mergeFieldsStateWithMacroValues({ fieldsState, appliedMacro }),
        ).toEqual({
            1: { id: 1, value: setCustomFieldValueAction.arguments.value },
            2: { id: 2, value: 'ok' },
        })
    })
})

describe('mergeCustomerFieldsStateWithMacroValues', () => {
    it('should merge customer field values from macro actions', () => {
        const fieldsState = {
            1: { id: 1, value: 'old customer value' },
            2: { id: 2, value: 'unchanged customer value' },
        }

        const appliedMacro = {
            ...macroFixture,
            actions: [setCustomerCustomFieldValueAction],
        }

        const result = mergeCustomerFieldsStateWithMacroValues({
            fieldsState,
            appliedMacro,
        })

        expect(result[1].value).toBe('Customer field value')
        expect(result[2].value).toBe('unchanged customer value')
    })

    it('should handle empty actions', () => {
        const fieldsState = {
            1: { id: 1, value: 'old customer value' },
        }

        const appliedMacro = {
            ...macroFixture,
            actions: [],
        }

        const result = mergeCustomerFieldsStateWithMacroValues({
            fieldsState,
            appliedMacro,
        })

        expect(result[1].value).toBe('old customer value')
    })

    it('should handle actions without value', () => {
        const fieldsState = {
            1: { id: 1, value: 'old customer value' },
        }

        const actionWithoutValue = {
            ...setCustomerCustomFieldValueAction,
            arguments: {
                ...setCustomerCustomFieldValueAction.arguments,
                value: '',
            },
        }

        const appliedMacro = {
            ...macroFixture,
            actions: [actionWithoutValue],
        }

        const result = mergeCustomerFieldsStateWithMacroValues({
            fieldsState,
            appliedMacro,
        })

        expect(result[1].value).toBe('old customer value')
    })

    it('should handle actions without custom_field_id', () => {
        const fieldsState = {
            1: { id: 1, value: 'old customer value' },
        }

        const actionWithoutFieldId = {
            ...setCustomerCustomFieldValueAction,
            arguments: {
                ...setCustomerCustomFieldValueAction.arguments,
                custom_field_id: undefined,
            },
        }

        const appliedMacro = {
            ...macroFixture,
            actions: [actionWithoutFieldId],
        }

        const result = mergeCustomerFieldsStateWithMacroValues({
            fieldsState,
            appliedMacro,
        })

        expect(result[1].value).toBe('old customer value')
    })

    it('should create new customer field entries when absent in state', () => {
        const fieldsState = {
            1: { id: 1, value: 'existing customer value' },
        }

        const appliedMacro = {
            ...macroFixture,
            actions: [
                setCustomerCustomFieldValueAction,
                {
                    ...setCustomerCustomFieldValueAction,
                    arguments: {
                        ...setCustomerCustomFieldValueAction.arguments,
                        custom_field_id: 2,
                        value: 'New customer value',
                    },
                },
            ],
        }

        const result = mergeCustomerFieldsStateWithMacroValues({
            fieldsState,
            appliedMacro,
        })

        expect(result[1].value).toBe('Customer field value')
        expect(result[2].value).toBe('New customer value')
    })

    it('should preserve other properties on existing customer fields', () => {
        const fieldsState = {
            1: { id: 1, value: 'original', dirty: false },
        }

        const appliedMacro = {
            ...macroFixture,
            actions: [setCustomerCustomFieldValueAction],
        }

        const result = mergeCustomerFieldsStateWithMacroValues({
            fieldsState,
            appliedMacro,
        })

        expect(result[1]).toEqual({
            id: 1,
            dirty: false,
            value: 'Customer field value',
        })
    })
})
