import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { ObjectType } from '@gorgias/helpdesk-types'

import { useTicketFieldsStore } from '../store/useTicketFieldsStore'
import { getInvalidTicketFieldIds } from '../utils/getInvalidTicketFieldIds'
import { useCustomFieldDefinitions } from './useCustomFieldDefinitions'
import { useCustomFieldsConditionsEvaluationResults } from './useCustomFieldsConditionsEvaluationResults'

export function useTicketFieldsValidation(ticketId: number) {
    const fields = useTicketFieldsStore((state) => state.fields)
    const updateFieldError = useTicketFieldsStore(
        (state) => state.updateFieldError,
    )
    const setHasAttemptedToCloseTicket = useTicketFieldsStore(
        (state) => state.setHasAttemptedToCloseTicket,
    )

    const { data: fieldDefinitions, isLoading: isLoadingDefinitions } =
        useCustomFieldDefinitions({
            archived: false,
            object_type: ObjectType.Ticket,
        })

    const { evaluationResults, conditionsLoading } =
        useCustomFieldsConditionsEvaluationResults()

    const validateTicketFields = useCallback(() => {
        if (
            isLoadingDefinitions ||
            conditionsLoading ||
            !fieldDefinitions?.data
        ) {
            return { hasErrors: false, invalidFieldIds: [] }
        }

        const invalidFieldIds = getInvalidTicketFieldIds({
            fields,
            fieldDefinitions: fieldDefinitions.data,
            evaluationResults,
        })

        if (invalidFieldIds.length > 0) {
            logEvent(SegmentEvent.CustomFieldTicketValueRequiredMissingError, {
                ticketId,
            })

            invalidFieldIds.forEach((fieldId) => {
                updateFieldError(fieldId, true)
            })

            setHasAttemptedToCloseTicket(true)

            return { hasErrors: true, invalidFieldIds }
        }

        setHasAttemptedToCloseTicket(false)
        return { hasErrors: false, invalidFieldIds: [] }
    }, [
        ticketId,
        fields,
        fieldDefinitions,
        evaluationResults,
        isLoadingDefinitions,
        conditionsLoading,
        updateFieldError,
        setHasAttemptedToCloseTicket,
    ])

    return {
        validateTicketFields,
        isValidating: isLoadingDefinitions || conditionsLoading,
    }
}
