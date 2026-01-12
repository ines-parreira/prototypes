import { useMemo } from 'react'

import { ObjectType } from '@gorgias/helpdesk-types'

import { useTicketFieldsStore } from '../store/useTicketFieldsStore'
import type { CustomFieldConditionsEvaluationResults } from '../utils/evaluateCustomFieldsConditions'
import { evaluateCustomFieldsConditions } from '../utils/evaluateCustomFieldsConditions'
import { useCustomFieldConditions } from './useCustomFieldConditions'

export const useCustomFieldsConditionsEvaluationResults = (): {
    evaluationResults: CustomFieldConditionsEvaluationResults
    conditionsLoading: boolean
} => {
    const { customFieldConditions, isLoading: conditionsLoading } =
        useCustomFieldConditions({
            objectType: ObjectType.Ticket,
            includeDeactivated: false,
            enabled: true,
        })

    const customFields = useTicketFieldsStore((state) => state.fields)

    const evaluationResults = useMemo(
        () =>
            evaluateCustomFieldsConditions(customFieldConditions, customFields),
        [customFieldConditions, customFields],
    )

    return {
        evaluationResults,
        conditionsLoading,
    }
}
