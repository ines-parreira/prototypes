import {Macro} from '@gorgias/api-queries'
import {useCallback, useMemo} from 'react'

import useFlag from 'common/flags/hooks/useFlag'
import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {OBJECT_TYPES} from 'custom-fields/constants'
import {evaluateCustomFieldsConditions} from 'custom-fields/helpers/evaluateCustomFieldsConditions'
import {useCustomFieldConditions} from 'custom-fields/hooks/queries/useCustomFieldConditions'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    setHasAttemptedToCloseTicket,
    triggerTicketFieldsErrors,
} from 'state/ticket/actions'
import {
    getAppliedMacro,
    getTicketFieldState,
    getTicket,
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
        false
    )

    const {
        data: {data: fieldDefinitions = []} = {},
        isLoading: isTicketFieldDefinitionLoading,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.TICKET,
    })
    const {
        customFieldConditions: ticketFieldConditions,
        isLoading: isTicketFieldConditionsLoading,
    } = useCustomFieldConditions(
        OBJECT_TYPES.TICKET,
        conditionalFieldsSupported
    )

    const customFieldsEvaluatedConditions = useMemo(
        () =>
            evaluateCustomFieldsConditions(
                ticketFieldConditions,
                OBJECT_TYPES.TICKET,
                ticketState
            ),
        [ticketFieldConditions, ticketState]
    )

    const checkTicketFieldErrors = useCallback(
        ({includeMacro = false}: {includeMacro?: boolean} = {}) => {
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
                    ? customFieldsEvaluatedConditions
                    : {},
            })

            if (
                !isTicketFieldDefinitionLoading &&
                (!conditionalFieldsSupported ||
                    !isTicketFieldConditionsLoading) &&
                invalidFields.length
            ) {
                logEvent(
                    SegmentEvent.CustomFieldTicketValueRequiredMissingError,
                    {
                        ticketId,
                    }
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
            customFieldsEvaluatedConditions,
            appliedMacro,
            isTicketFieldDefinitionLoading,
            isTicketFieldConditionsLoading,
            dispatch,
            conditionalFieldsSupported,
        ]
    )

    return {checkTicketFieldErrors}
}
