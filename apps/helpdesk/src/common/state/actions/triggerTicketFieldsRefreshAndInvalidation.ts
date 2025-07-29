import {
    listCustomFieldConditions,
    listCustomFields,
} from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { evaluateCustomFieldsConditions } from 'custom-fields/helpers/evaluateCustomFieldsConditions'
import { CustomFieldConditionsEvaluationResults } from 'custom-fields/types'
import { getTicket, getTicketFieldState } from 'state/ticket/selectors'
import { RootState, StoreDispatch } from 'state/types'
import { getInvalidTicketFieldIds } from 'utils/customFields'

import setInvalidCustomFieldsToErrored from './setInvalidCustomFieldsToErrored'

export default function triggerTicketFieldsRefreshAndInvalidation() {
    return async (dispatch: StoreDispatch, getState: () => RootState) => {
        const currentState = getState()

        let customFieldsEvaluatedConditions: CustomFieldConditionsEvaluationResults

        const customFieldConditionsQueryKey =
            queryKeys.customFieldConditions.listCustomFieldConditions({
                object_type: OBJECT_TYPES.TICKET,
                include_deactivated: false,
            })
        await appQueryClient.invalidateQueries({
            queryKey: customFieldConditionsQueryKey,
        })

        const refetchedCustomFieldConditions =
            appQueryClient.getQueryData<
                Awaited<ReturnType<typeof listCustomFieldConditions>>
            >(customFieldConditionsQueryKey)?.data?.data || []
        customFieldsEvaluatedConditions = evaluateCustomFieldsConditions(
            refetchedCustomFieldConditions,
            OBJECT_TYPES.TICKET,
            getTicket(currentState),
        )

        await appQueryClient.invalidateQueries({
            queryKey: queryKeys.customFields.all(),
        })
        const refetchedCustomFieldDefinitions =
            appQueryClient.getQueryData<
                Awaited<ReturnType<typeof listCustomFields>>
            >(
                queryKeys.customFields.listCustomFields({
                    archived: false,
                    object_type: OBJECT_TYPES.TICKET,
                }),
            )?.data?.data || []

        const invalidFields = getInvalidTicketFieldIds({
            fieldsState: getTicketFieldState(currentState),
            fieldDefinitions: refetchedCustomFieldDefinitions,
            evaluatedConditions: customFieldsEvaluatedConditions,
        })
        dispatch(setInvalidCustomFieldsToErrored(invalidFields))
    }
}
