import {listCustomFieldConditions} from '@gorgias/api-client'
import {queryKeys} from '@gorgias/api-queries'

import {useFlags} from 'launchdarkly-react-client-sdk'

import {appQueryClient} from 'api/queryClient'
import {FeatureFlagKey} from 'config/featureFlags'
import {OBJECT_TYPES} from 'custom-fields/constants'
import {evaluateCustomFieldsConditions} from 'custom-fields/helpers/evaluateCustomFieldsConditions'
import {customFieldDefinitionKeys} from 'custom-fields/hooks/queries/queries'
import {getCustomFields} from 'custom-fields/resources'
import {CustomFieldConditionsEvaluationResults} from 'custom-fields/types'
import {getTicketFieldState, getTicket} from 'state/ticket/selectors'
import {RootState, StoreDispatch} from 'state/types'
import {getInvalidTicketFieldIds} from 'utils/customFields'

import setInvalidCustomFieldsToErrored from './setInvalidCustomFieldsToErrored'

export default function triggerTicketFieldsRefreshAndInvalidation() {
    return async (dispatch: StoreDispatch, getState: () => RootState) => {
        const flags = useFlags()
        const conditionalFieldsSupported =
            !!flags[FeatureFlagKey.TicketConditionalFields]
        const currentState = getState()

        let customFieldsEvaluatedConditions: CustomFieldConditionsEvaluationResults
        if (conditionalFieldsSupported) {
            const customFieldConditionsQueryKey =
                queryKeys.customFieldConditions.listCustomFieldConditions({
                    object_type: OBJECT_TYPES.TICKET,
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
                getTicket(currentState)
            )
        } else {
            customFieldsEvaluatedConditions = {}
        }

        await appQueryClient.invalidateQueries({
            queryKey: customFieldDefinitionKeys.all(),
        })
        const refetchedCustomFieldDefinitions =
            appQueryClient.getQueryData<
                Awaited<ReturnType<typeof getCustomFields>>
            >(
                customFieldDefinitionKeys.list({
                    archived: false,
                    object_type: OBJECT_TYPES.TICKET,
                })
            )?.data?.data || []

        const invalidFields = getInvalidTicketFieldIds({
            fieldsState: getTicketFieldState(currentState),
            fieldDefinitions: refetchedCustomFieldDefinitions,
            evaluatedConditions: customFieldsEvaluatedConditions,
        })
        dispatch(setInvalidCustomFieldsToErrored(invalidFields))
    }
}
