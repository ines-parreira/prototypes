import { useMemo } from 'react'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { evaluateCustomFieldsConditions } from 'custom-fields/helpers/evaluateCustomFieldsConditions'
import {
    CustomFieldConditionsEvaluationResults,
    CustomFieldObjectTypes,
} from 'custom-fields/types'

import { useCustomFieldConditions } from './queries/useCustomFieldConditions'

export const useCustomFieldsConditionsEvaluationResults = (
    objectType: CustomFieldObjectTypes,
    sourceObject: Record<string, any>,
    conditionalFieldsSupported: boolean,
): {
    evaluationResults: CustomFieldConditionsEvaluationResults
    conditionsLoading: boolean
} => {
    const { customFieldConditions, isLoading: conditionsLoading } =
        useCustomFieldConditions({
            objectType: OBJECT_TYPES.TICKET,
            includeDeactivated: false,
            enabled: conditionalFieldsSupported,
        })

    const evaluationResults = useMemo(
        () =>
            evaluateCustomFieldsConditions(
                customFieldConditions,
                objectType,
                sourceObject,
            ),
        [customFieldConditions, objectType, sourceObject],
    )
    return {
        evaluationResults,
        conditionsLoading,
    }
}
