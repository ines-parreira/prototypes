import type { CustomField } from '@gorgias/helpdesk-types'
import { ExpressionFieldType, RequirementType } from '@gorgias/helpdesk-types'

import type { TicketFieldsState } from '../store/useTicketFieldsStore'
import type { CustomFieldConditionsEvaluationResults } from '../utils/evaluateCustomFieldsConditions'
import { getInvalidTicketFieldIds } from '../utils/getInvalidTicketFieldIds'

describe('getInvalidTicketFieldIds', () => {
    it('should return empty array when all required fields are filled', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
            {
                id: 2,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const fields: TicketFieldsState = {
            1: { id: 1, value: 'filled value' },
            2: { id: 2, value: 'another value' },
        }

        const evaluationResults: CustomFieldConditionsEvaluationResults = {}

        const result = getInvalidTicketFieldIds({
            fields,
            fieldDefinitions,
            evaluationResults,
        })

        expect(result).toEqual([])
    })

    it('should return field IDs for empty required fields', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
            {
                id: 2,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const fields: TicketFieldsState = {
            1: { id: 1, value: '' },
            2: { id: 2, value: undefined },
        }

        const evaluationResults: CustomFieldConditionsEvaluationResults = {}

        const result = getInvalidTicketFieldIds({
            fields,
            fieldDefinitions,
            evaluationResults,
        })

        expect(result).toEqual([1, 2])
    })

    it('should handle number fields correctly (0 is valid but NaN is invalid)', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
            {
                id: 2,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const fields: TicketFieldsState = {
            1: { id: 1, value: 0 },
            2: { id: 2, value: NaN },
        }

        const evaluationResults: CustomFieldConditionsEvaluationResults = {}

        const result = getInvalidTicketFieldIds({
            fields,
            fieldDefinitions,
            evaluationResults,
        })

        expect(result).toEqual([2])
    })

    it('should handle boolean fields correctly (false is valid)', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
            {
                id: 2,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const fields: TicketFieldsState = {
            1: { id: 1, value: false },
            2: { id: 2, value: true },
        }

        const evaluationResults: CustomFieldConditionsEvaluationResults = {}

        const result = getInvalidTicketFieldIds({
            fields,
            fieldDefinitions,
            evaluationResults,
        })

        expect(result).toEqual([])
    })

    it('should handle conditionally required fields', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
            {
                id: 2,
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
        ]

        const fields: TicketFieldsState = {
            1: { id: 1, value: '' },
            2: { id: 2, value: '' },
        }

        const evaluationResults: CustomFieldConditionsEvaluationResults = {
            1: ExpressionFieldType.Required,
            2: ExpressionFieldType.Visible,
        }

        const result = getInvalidTicketFieldIds({
            fields,
            fieldDefinitions,
            evaluationResults,
        })

        expect(result).toEqual([1])
    })

    it('should not include optional fields with empty values', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
            {
                id: 2,
                required: false,
                requirement_type: RequirementType.Visible,
            } as CustomField,
        ]

        const fields: TicketFieldsState = {
            1: { id: 1, value: '' },
            2: { id: 2, value: '' },
        }

        const evaluationResults: CustomFieldConditionsEvaluationResults = {}

        const result = getInvalidTicketFieldIds({
            fields,
            fieldDefinitions,
            evaluationResults,
        })

        expect(result).toEqual([1])
    })

    it('should handle missing field state as empty', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const fields: TicketFieldsState = {}

        const evaluationResults: CustomFieldConditionsEvaluationResults = {}

        const result = getInvalidTicketFieldIds({
            fields,
            fieldDefinitions,
            evaluationResults,
        })

        expect(result).toEqual([1])
    })

    it('should handle mixed scenarios with multiple field types', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
            {
                id: 2,
                required: false,
                requirement_type: RequirementType.Visible,
            } as CustomField,
            {
                id: 3,
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
            {
                id: 4,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const fields: TicketFieldsState = {
            1: { id: 1, value: 'filled' },
            2: { id: 2, value: '' },
            3: { id: 3, value: '' },
            4: { id: 4, value: '' },
        }

        const evaluationResults: CustomFieldConditionsEvaluationResults = {
            3: ExpressionFieldType.Required,
        }

        const result = getInvalidTicketFieldIds({
            fields,
            fieldDefinitions,
            evaluationResults,
        })

        expect(result).toEqual([3, 4])
    })
})
