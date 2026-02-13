import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { ObjectType } from '@gorgias/helpdesk-types'

import { useTicketFieldsStore } from '../store/useTicketFieldsStore'
import { getInvalidTicketFieldIds } from '../utils/getInvalidTicketFieldIds'
import type { MacroTicketFieldValues } from '../utils/getMacroTicketFieldValues'
import { mergeTicketFieldsValues } from '../utils/mergeTicketFieldsValues'
import { useCustomFieldDefinitions } from './useCustomFieldDefinitions'
import { useCustomFieldsConditionsEvaluationResults } from './useCustomFieldsConditionsEvaluationResults'

export function useTicketFieldsValidation(ticketId: number) {
    const fields = useTicketFieldsStore((state) => state.fields)
    const updateFieldError = useTicketFieldsStore(
        (state) => state.updateFieldError,
    )
    const incrementValidationFailureCount = useTicketFieldsStore(
        (state) => state.incrementValidationFailureCount,
    )

    const { data: fieldDefinitions, isLoading: isLoadingDefinitions } =
        useCustomFieldDefinitions({
            archived: false,
            object_type: ObjectType.Ticket,
        })

    const { evaluationResults, conditionsLoading } =
        useCustomFieldsConditionsEvaluationResults()

    const validateTicketFields = useCallback(
        (appliedMacroTicketFieldValues: MacroTicketFieldValues = {}) => {
            if (
                isLoadingDefinitions ||
                conditionsLoading ||
                !fieldDefinitions?.data
            ) {
                return { hasErrors: false, invalidFieldIds: [] }
            }

            const mergedFields = mergeTicketFieldsValues(
                fields,
                appliedMacroTicketFieldValues,
            )

            const invalidFieldIds = getInvalidTicketFieldIds({
                fields: mergedFields,
                fieldDefinitions: fieldDefinitions.data,
                evaluationResults,
            })

            if (invalidFieldIds.length > 0) {
                logEvent(
                    SegmentEvent.CustomFieldTicketValueRequiredMissingError,
                    {
                        ticketId,
                    },
                )

                invalidFieldIds.forEach((fieldId) => {
                    updateFieldError(fieldId, true)
                })

                incrementValidationFailureCount()

                return { hasErrors: true, invalidFieldIds }
            }

            return { hasErrors: false, invalidFieldIds: [] }
        },
        [
            ticketId,
            fields,
            fieldDefinitions,
            evaluationResults,
            isLoadingDefinitions,
            conditionsLoading,
            updateFieldError,
            incrementValidationFailureCount,
        ],
    )

    return {
        validateTicketFields,
        isValidating: isLoadingDefinitions || conditionsLoading,
    }
}
