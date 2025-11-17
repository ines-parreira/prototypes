import type { AxiosError } from 'axios'
import { useHistory } from 'react-router-dom'

import { useDeleteIntegration } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useStoreManagementState } from '../../../StoreManagementProvider'

export default function useStoreDeleter() {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { refetchIntegrations, refetchMapping } = useStoreManagementState()

    const connectMutationOptions = {
        onSuccess: () => {
            void dispatch(
                notify({
                    message:
                        'Store is successfully deleted. It may take a minute for all channels and features to disconnect.',
                    status: NotificationStatus.Success,
                }),
            )
            refetchIntegrations()
            refetchMapping()
            history.push('/app/settings/store-management')
        },
        onError: (
            error: AxiosError<{
                error?: { msg: string }
            }>,
        ) => {
            void dispatch(
                notify({
                    title: 'Failed to delete integration',
                    message:
                        error.response?.data?.error?.msg ||
                        'Failed to delete integration',
                    allowHTML: true,
                    status: NotificationStatus.Error,
                }),
            )
        },
    }

    const { mutate: deleteIntegration, isLoading: isDeleting } =
        useDeleteIntegration({
            mutation: connectMutationOptions,
        })

    return {
        deleteIntegration,
        isDeleting,
    }
}
