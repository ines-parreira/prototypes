import { ExpressionFieldSource, ExpressionOperator } from '@gorgias/api-queries'
import { ExpressionFieldType } from '@gorgias/api-types'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldConditions } from 'custom-fields/hooks/queries/useCustomFieldConditions'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useCustomFieldsConditionsEvaluationResults } from '../useCustomFieldsConditionsEvaluationResults'

jest.mock('custom-fields/hooks/queries/useCustomFieldConditions')
const useCustomFieldConditionsMock = assumeMock(useCustomFieldConditions)

describe('useCustomFieldsConditionsEvaluationResults', () => {
    const requiredCustomFieldCondition = {
        ...customFieldCondition,
        expression: [
            {
                field: 'status',
                operator: ExpressionOperator.Is,
                values: ['open'],
                field_source: ExpressionFieldSource.Ticket,
            },
            {
                field: 100,
                operator: ExpressionOperator.Is,
                values: ['high'],
                field_source: ExpressionFieldSource.TicketCustomFields,
            },
        ],
        requirements: [
            {
                field_id: 500,
                type: ExpressionFieldType.Required,
            },
        ],
    }
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return loading state initially with no conditions', () => {
        useCustomFieldConditionsMock.mockReturnValue({
            isLoading: true,
            customFieldConditions: [],
        } as any)

        const { result } = renderHook(() =>
            useCustomFieldsConditionsEvaluationResults(OBJECT_TYPES.TICKET, {}),
        )
        expect(useCustomFieldConditions).toHaveBeenCalledWith({
            objectType: OBJECT_TYPES.TICKET,
            includeDeactivated: false,
            enabled: true,
        })
        expect(result.current.conditionsLoading).toBe(true)
        expect(result.current.evaluationResults).toEqual({})
    })

    it('should return evaluation results when conditions are met', () => {
        useCustomFieldConditionsMock.mockReturnValue({
            isLoading: false,
            customFieldConditions: [requiredCustomFieldCondition],
        } as any)

        const { result } = renderHook(() =>
            useCustomFieldsConditionsEvaluationResults(OBJECT_TYPES.TICKET, {
                status: 'open',
                custom_fields: { 100: { value: 'high' } },
            }),
        )

        expect(useCustomFieldConditions).toHaveBeenCalledWith({
            objectType: OBJECT_TYPES.TICKET,
            includeDeactivated: false,
            enabled: true,
        })
        expect(result.current.conditionsLoading).toBe(false)
        expect(result.current.evaluationResults).toEqual({
            500: ExpressionFieldType.Required,
        })
    })

    it('should return empty evaluation results when conditions are not met', () => {
        useCustomFieldConditionsMock.mockReturnValue({
            isLoading: false,
            customFieldConditions: [requiredCustomFieldCondition],
        } as any)

        const { result } = renderHook(() =>
            useCustomFieldsConditionsEvaluationResults(OBJECT_TYPES.TICKET, {
                status: 'closed',
            }),
        )

        expect(useCustomFieldConditions).toHaveBeenCalledWith({
            objectType: OBJECT_TYPES.TICKET,
            includeDeactivated: false,
            enabled: true,
        })
        expect(result.current.conditionsLoading).toBe(false)
        expect(result.current.evaluationResults).toEqual({})
    })
})
