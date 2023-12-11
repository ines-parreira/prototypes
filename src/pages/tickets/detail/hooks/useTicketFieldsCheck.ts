import {useCallback} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {triggerTicketFieldsErrors} from 'state/ticket/actions'
import {getAppliedMacro, getTicketFieldState} from 'state/ticket/selectors'
import {
    getInvalidTicketFieldIds,
    mergeFieldsStateWithMacroValues,
} from 'utils/customFields'
import {Macro} from 'models/macro/types'

export function useTicketFieldsCheck(ticketId: number) {
    const dispatch = useAppDispatch()
    const fieldsState = useAppSelector(getTicketFieldState)
    const appliedMacro = useAppSelector(getAppliedMacro)

    const {
        data: {data: fieldDefinitions = []} = {},
        isLoading: isTicketFieldDefinitionLoading,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: 'Ticket',
    })

    const checkTicketFieldErrors = useCallback(
        ({includeMacro = false}: {includeMacro?: boolean} = {}) => {
            // We need to take into account the fact that a macro
            // can also set some custom fields afterwards
            const invalidFields = getInvalidTicketFieldIds({
                fieldsState: includeMacro
                    ? mergeFieldsStateWithMacroValues({
                          fieldsState,
                          appliedMacro: appliedMacro.toJS() as Macro,
                      })
                    : fieldsState,
                fieldDefinitions,
            })

            if (!isTicketFieldDefinitionLoading && invalidFields.length) {
                logEvent(
                    SegmentEvent.CustomFieldTicketValueRequiredMissingError,
                    {
                        ticketId,
                    }
                )
                dispatch(triggerTicketFieldsErrors(invalidFields))
                return true
            }
            return false
        },
        [
            ticketId,
            fieldsState,
            fieldDefinitions,
            appliedMacro,
            isTicketFieldDefinitionLoading,
            dispatch,
        ]
    )

    return {checkTicketFieldErrors}
}
