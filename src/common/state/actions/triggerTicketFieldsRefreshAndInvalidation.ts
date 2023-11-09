import {appQueryClient} from 'api/queryClient'
import {customFieldDefinitionKeys} from 'models/customField/queries'
import {getCustomFields} from 'models/customField/resources'
import {getTicketFieldState} from 'state/ticket/selectors'
import {RootState, StoreDispatch} from 'state/types'
import {getInvalidTicketFieldIds} from 'utils/customFields'

import setInvalidCustomFieldsToErrored from './setInvalidCustomFieldsToErrored'

export default function triggerTicketFieldsRefreshAndInvalidation() {
    return async (dispatch: StoreDispatch, getState: () => RootState) => {
        await appQueryClient.invalidateQueries({
            queryKey: customFieldDefinitionKeys.all(),
        })
        const invalidFields = getInvalidTicketFieldIds({
            fieldsState: getTicketFieldState(getState()),
            fieldDefinitions:
                appQueryClient.getQueryData<
                    Awaited<ReturnType<typeof getCustomFields>>
                >(
                    customFieldDefinitionKeys.list({
                        archived: false,
                        object_type: 'Ticket',
                    })
                )?.data?.data || [],
        })
        dispatch(setInvalidCustomFieldsToErrored(invalidFields))
    }
}
