import {
    EmailIntegration,
    GmailIntegration,
    HttpResponse,
    useDeleteIntegration,
} from '@gorgias/api-queries'
import {useCallback} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {isGorgiasApiError} from 'models/api/types'

import {OutlookIntegration} from 'models/integration/types'
import history from 'pages/history'
import {DELETE_INTEGRATION_SUCCESS} from 'state/integrations/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {listUrl} from './hooks/useEmailOnboarding'

export default function useDeleteEmailIntegration(
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
) {
    const dispatch = useAppDispatch()

    const deleteMutationOptions = {
        onSuccess: () => {
            if (integration) {
                dispatch({
                    type: DELETE_INTEGRATION_SUCCESS,
                    id: integration.id,
                })
                history.push(listUrl())
            }
        },
        onError: (error: HttpResponse<unknown>) => {
            const message = isGorgiasApiError(error)
                ? error.response.data.error.msg
                : 'Failed to delete integration'

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message,
                })
            )
        },
    }

    const {mutate: performDelete, isLoading: isDeleting} = useDeleteIntegration(
        {
            mutation: deleteMutationOptions,
        }
    )

    const deleteIntegration = useCallback(() => {
        void performDelete({
            id: integration.id,
        })
    }, [integration, performDelete])

    return {
        deleteIntegration,
        isDeleting,
    }
}
