import { useCallback } from 'react'

import { Macro } from '@gorgias/api-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useCustomFieldsConditionsEvaluationResults } from 'custom-fields/hooks/useCustomFieldsConditionsEvaluationResults'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    setHasAttemptedToCloseTicket,
    triggerTicketFieldsErrors,
} from 'state/ticket/actions'
import {
    getAppliedMacro,
    getTicket,
    getTicketFieldState,
} from 'state/ticket/selectors'
import {
    getInvalidTicketFieldIds,
    mergeFieldsStateWithMacroValues,
} from 'utils/customFields'

export function useTicketFieldsCheck(ticketId: number) {
    const dispatch = useAppDispatch()
    const fieldsState = useAppSelector(getTicketFieldState)
    const appliedMacro = useAppSelector(getAppliedMacro)
    const ticketState = useAppSelector(getTicket)
    const conditionalFieldsSupported = useFlag(
        FeatureFlagKey.TicketConditionalFields,
    )

    const {
        data: { data: fieldDefinitions = [] } = {},
        isLoading: isTicketFieldDefinitionLoading,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.TICKET,
    })
    const {
        evaluationResults: ticketFieldConditionsEvaluationResults,
        conditionsLoading: ticketFieldConditionsLoading,
    } = useCustomFieldsConditionsEvaluationResults(
        OBJECT_TYPES.TICKET,
        ticketState,
        conditionalFieldsSupported,
    )

    const checkTicketFieldErrors = useCallback(
        ({ includeMacro = false }: { includeMacro?: boolean } = {}) => {
            // We need to take into account the fact that a macro
            // can also set some custom fields afterwards
            const invalidFields = getInvalidTicketFieldIds({
                fieldsState:
                    includeMacro && appliedMacro
                        ? mergeFieldsStateWithMacroValues({
                              fieldsState,
                              appliedMacro: appliedMacro.toJS() as Macro,
                          })
                        : fieldsState,
                fieldDefinitions,
                evaluatedConditions: conditionalFieldsSupported
                    ? ticketFieldConditionsEvaluationResults
                    : {},
            })

            if (
                !isTicketFieldDefinitionLoading &&
                (!conditionalFieldsSupported ||
                    !ticketFieldConditionsLoading) &&
                invalidFields.length
            ) {
                logEvent(
                    SegmentEvent.CustomFieldTicketValueRequiredMissingError,
                    {
                        ticketId,
                    },
                )
                dispatch(triggerTicketFieldsErrors(invalidFields))
                dispatch(setHasAttemptedToCloseTicket(true))
                return true
            }
            dispatch(setHasAttemptedToCloseTicket(false))
            return false
        },
        [
            ticketId,
            fieldsState,
            fieldDefinitions,
            ticketFieldConditionsEvaluationResults,
            appliedMacro,
            isTicketFieldDefinitionLoading,
            ticketFieldConditionsLoading,
            dispatch,
            conditionalFieldsSupported,
        ],
    )

    return { checkTicketFieldErrors }
}
