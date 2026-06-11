import { useCallback } from 'react'

import { history } from '@repo/routing'

import { toast } from '@gorgias/axiom'
import type {
    EmailIntegration,
    GmailIntegration,
    HttpResponse,
} from '@gorgias/helpdesk-queries'
import { useDeleteIntegration } from '@gorgias/helpdesk-queries'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import type { OutlookIntegration } from 'models/integration/types'
import { DELETE_INTEGRATION_SUCCESS } from 'state/integrations/constants'

import { listUrl } from './hooks/useEmailOnboarding'

export function useDeleteEmailIntegration(
    integration: EmailIntegration | GmailIntegration | OutlookIntegration,
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

            toast.error(message)
        },
    }

    const { mutate: performDelete, isLoading: isDeleting } =
        useDeleteIntegration({
            mutation: deleteMutationOptions,
        })

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
