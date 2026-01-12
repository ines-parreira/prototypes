import { renderHook } from '@testing-library/react'

import type { CustomField } from '@gorgias/helpdesk-types'
import {
    ExpressionFieldType,
    ManagedTicketFieldType,
    RequirementType,
} from '@gorgias/helpdesk-types'

import { useFilteredTicketFields } from '../hooks/useFilteredTicketFields'
import type { TicketFieldConditionsEvaluationResults } from '../hooks/useFilteredTicketFields'

describe('useFilteredTicketFields', () => {
    it('should return empty array when no field definitions provided', () => {
        const { result } = renderHook(() => useFilteredTicketFields([], {}))

        expect(result.current).toEqual([])
    })

    it('should return all required fields', () => {
        const fields: CustomField[] = [
            {
                id: 1,
                label: 'Required Field',
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const { result } = renderHook(() => useFilteredTicketFields(fields, {}))

        expect(result.current).toHaveLength(1)
        expect(result.current[0]).toEqual({
            fieldDefinition: fields[0],
            isRequired: true,
        })
    })

    it('should return all non-required, non-conditional fields', () => {
        const fields: CustomField[] = [
            {
                id: 1,
                label: 'Optional Field',
                required: false,
                requirement_type: RequirementType.Visible,
            } as CustomField,
        ]

        const { result } = renderHook(() => useFilteredTicketFields(fields, {}))

        expect(result.current).toHaveLength(1)
        expect(result.current[0]).toEqual({
            fieldDefinition: fields[0],
            isRequired: false,
        })
    })

    it('should filter out AI-managed fields', () => {
        const fields: CustomField[] = [
            {
                id: 1,
                label: 'Normal Field',
                required: false,
                requirement_type: RequirementType.Visible,
            } as CustomField,
            {
                id: 2,
                label: 'AI Managed Field',
                required: false,
                requirement_type: RequirementType.Visible,
                managed_type: ManagedTicketFieldType.AiIntent,
            } as CustomField,
        ]

        const { result } = renderHook(() => useFilteredTicketFields(fields, {}))

        expect(result.current).toHaveLength(1)
        expect(result.current[0].fieldDefinition.id).toBe(1)
    })

    it('should show conditionally required fields when evaluation result is required', () => {
        const fields: CustomField[] = [
            {
                id: 1,
                label: 'Conditional Field',
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
        ]

        const evaluationResults: TicketFieldConditionsEvaluationResults = {
            1: ExpressionFieldType.Required,
        }

        const { result } = renderHook(() =>
            useFilteredTicketFields(fields, evaluationResults),
        )

        expect(result.current).toHaveLength(1)
        expect(result.current[0]).toEqual({
            fieldDefinition: fields[0],
            isRequired: true,
        })
    })

    it('should show conditionally visible fields when evaluation result is visible', () => {
        const fields: CustomField[] = [
            {
                id: 1,
                label: 'Conditional Field',
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
        ]

        const evaluationResults: TicketFieldConditionsEvaluationResults = {
            1: ExpressionFieldType.Visible,
        }

        const { result } = renderHook(() =>
            useFilteredTicketFields(fields, evaluationResults),
        )

        expect(result.current).toHaveLength(1)
        expect(result.current[0]).toEqual({
            fieldDefinition: fields[0],
            isRequired: false,
        })
    })

    it('should hide conditionally hidden fields', () => {
        const fields: CustomField[] = [
            {
                id: 1,
                label: 'Hidden Conditional Field',
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
        ]

        const evaluationResults: TicketFieldConditionsEvaluationResults = {
            1: undefined,
        }

        const { result } = renderHook(() =>
            useFilteredTicketFields(fields, evaluationResults),
        )

        expect(result.current).toHaveLength(0)
    })

    it('should handle mixed field types correctly', () => {
        const fields: CustomField[] = [
            {
                id: 1,
                label: 'Always Required',
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
            {
                id: 2,
                label: 'Always Visible',
                required: false,
                requirement_type: RequirementType.Visible,
            } as CustomField,
            {
                id: 3,
                label: 'Conditionally Required',
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
            {
                id: 4,
                label: 'Conditionally Hidden',
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
            {
                id: 5,
                label: 'AI Managed',
                required: false,
                requirement_type: RequirementType.Visible,
                managed_type: ManagedTicketFieldType.AiIntent,
            } as CustomField,
        ]

        const evaluationResults: TicketFieldConditionsEvaluationResults = {
            3: ExpressionFieldType.Required,
            4: undefined,
        }

        const { result } = renderHook(() =>
            useFilteredTicketFields(fields, evaluationResults),
        )

        expect(result.current).toHaveLength(3)
        expect(result.current.map((f) => f.fieldDefinition.id)).toEqual([
            1, 2, 3,
        ])
    })

    it('should memoize result when inputs do not change', () => {
        const fields: CustomField[] = [
            {
                id: 1,
                label: 'Field',
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const evaluationResults: TicketFieldConditionsEvaluationResults = {}

        const { result, rerender } = renderHook(
            ({ fields, results }) => useFilteredTicketFields(fields, results),
            {
                initialProps: { fields, results: evaluationResults },
            },
        )

        const firstResult = result.current

        rerender({ fields, results: evaluationResults })

        expect(result.current).toBe(firstResult)
    })

    it('should update result when field definitions change', () => {
        const fields1: CustomField[] = [
            {
                id: 1,
                label: 'Field 1',
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const fields2: CustomField[] = [
            {
                id: 2,
                label: 'Field 2',
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        const { result, rerender } = renderHook(
            ({ fields }) => useFilteredTicketFields(fields, {}),
            {
                initialProps: { fields: fields1 },
            },
        )

        expect(result.current[0].fieldDefinition.id).toBe(1)

        rerender({ fields: fields2 })

        expect(result.current[0].fieldDefinition.id).toBe(2)
    })

    it('should update result when evaluation results change', () => {
        const fields: CustomField[] = [
            {
                id: 1,
                label: 'Conditional Field',
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
        ]

        const results1: TicketFieldConditionsEvaluationResults = {
            1: undefined,
        }

        const results2: TicketFieldConditionsEvaluationResults = {
            1: ExpressionFieldType.Visible,
        }

        const { result, rerender } = renderHook(
            ({ results }) => useFilteredTicketFields(fields, results),
            {
                initialProps: { results: results1 },
            },
        )

        expect(result.current).toHaveLength(0)

        rerender({ results: results2 })

        expect(result.current).toHaveLength(1)
    })
})
