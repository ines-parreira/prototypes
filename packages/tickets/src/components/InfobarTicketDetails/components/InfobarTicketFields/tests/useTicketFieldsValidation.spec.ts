import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CustomField } from '@gorgias/helpdesk-types'
import { ExpressionFieldType, RequirementType } from '@gorgias/helpdesk-types'

import * as useCustomFieldDefinitionsModule from '../hooks/useCustomFieldDefinitions'
import * as useCustomFieldsConditionsEvaluationResultsModule from '../hooks/useCustomFieldsConditionsEvaluationResults'
import { useTicketFieldsValidation } from '../hooks/useTicketFieldsValidation'
import { useTicketFieldsStore } from '../store/useTicketFieldsStore'

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        CustomFieldTicketValueRequiredMissingError:
            'CustomFieldTicketValueRequiredMissingError',
    },
}))

vi.mock('../hooks/useCustomFieldDefinitions')
vi.mock('../hooks/useCustomFieldsConditionsEvaluationResults')

describe('useTicketFieldsValidation', () => {
    const ticketId = 123

    beforeEach(() => {
        useTicketFieldsStore.getState().resetFields()
        vi.clearAllMocks()
    })

    it('should return hasErrors: false when all required fields are filled', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, 'filled value')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        const validation = result.current.validateTicketFields()

        expect(validation.hasErrors).toBe(false)
        expect(validation.invalidFieldIds).toEqual([])
        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should return hasErrors: true when required fields are empty', () => {
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

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, '')
        useTicketFieldsStore.getState().updateFieldValue(2, undefined)

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        const validation = result.current.validateTicketFields()

        expect(validation.hasErrors).toBe(true)
        expect(validation.invalidFieldIds).toEqual([1, 2])
    })

    it('should set hasError flag on invalid fields', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, '')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        result.current.validateTicketFields()

        const fields = useTicketFieldsStore.getState().fields
        expect(fields[1]?.hasError).toBe(true)
    })

    it('should increment validationFailureCount when validation fails', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, '')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        expect(useTicketFieldsStore.getState().validationFailureCount).toBe(0)

        result.current.validateTicketFields()

        expect(useTicketFieldsStore.getState().validationFailureCount).toBe(1)
    })

    it('should increment validationFailureCount on each failed validation attempt', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, '')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        result.current.validateTicketFields()
        result.current.validateTicketFields()
        result.current.validateTicketFields()

        expect(useTicketFieldsStore.getState().validationFailureCount).toBe(3)
    })

    it('should not modify validationFailureCount when validation passes', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, 'filled')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        result.current.validateTicketFields()

        expect(useTicketFieldsStore.getState().validationFailureCount).toBe(0)
    })

    it('should handle conditional required fields', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField,
        ]

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {
                1: ExpressionFieldType.Required,
            },
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, '')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        const validation = result.current.validateTicketFields()

        expect(validation.hasErrors).toBe(true)
        expect(validation.invalidFieldIds).toEqual([1])
    })

    it('should log Segment event on validation error', () => {
        const fieldDefinitions: CustomField[] = [
            {
                id: 1,
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField,
        ]

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, '')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        result.current.validateTicketFields()

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldTicketValueRequiredMissingError,
            { ticketId },
        )
    })

    it('should not validate when data is loading', () => {
        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: [],
            isLoading: true,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        const validation = result.current.validateTicketFields()

        expect(validation.hasErrors).toBe(false)
        expect(validation.invalidFieldIds).toEqual([])
        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should not validate when conditions are loading', () => {
        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: [],
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: true,
        })

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        const validation = result.current.validateTicketFields()

        expect(validation.hasErrors).toBe(false)
        expect(result.current.isValidating).toBe(true)
    })

    it('should pass validation when macro values fill required empty fields', () => {
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

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, '')
        useTicketFieldsStore.getState().updateFieldValue(2, '')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        const validation = result.current.validateTicketFields({
            1: 'macro value 1',
            2: 'macro value 2',
        })

        expect(validation.hasErrors).toBe(false)
        expect(validation.invalidFieldIds).toEqual([])
        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should fail validation when macro values only fill some required fields', () => {
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

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, '')
        useTicketFieldsStore.getState().updateFieldValue(2, '')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        const validation = result.current.validateTicketFields({
            1: 'macro value',
        })

        expect(validation.hasErrors).toBe(true)
        expect(validation.invalidFieldIds).toEqual([2])
    })

    it('should use store values for fields not present in macro values', () => {
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

        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: {
                data: fieldDefinitions,
            },
            isLoading: false,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })

        useTicketFieldsStore.getState().updateFieldValue(1, 'store value')
        useTicketFieldsStore.getState().updateFieldValue(2, '')

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        const validation = result.current.validateTicketFields({
            2: 'macro value',
        })

        expect(validation.hasErrors).toBe(false)
        expect(validation.invalidFieldIds).toEqual([])
    })

    it('should return isValidating true when any dependency is loading', () => {
        vi.spyOn(
            useCustomFieldDefinitionsModule,
            'useCustomFieldDefinitions',
        ).mockReturnValue({
            data: [],
            isLoading: true,
        } as any)

        vi.spyOn(
            useCustomFieldsConditionsEvaluationResultsModule,
            'useCustomFieldsConditionsEvaluationResults',
        ).mockReturnValue({
            evaluationResults: {},
            conditionsLoading: true,
        })

        const { result } = renderHook(() => useTicketFieldsValidation(ticketId))

        expect(result.current.isValidating).toBe(true)
    })
})
