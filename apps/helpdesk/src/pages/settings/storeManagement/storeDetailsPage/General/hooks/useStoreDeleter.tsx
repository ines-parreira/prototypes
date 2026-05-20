import { useHistory } from 'react-router-dom'

import { toast } from '@gorgias/axiom'
import { useDeleteIntegration } from '@gorgias/helpdesk-queries'

import { useStoreManagementState } from '../../../StoreManagementProvider'

export default function useStoreDeleter() {
    const history = useHistory()
    const { refetchIntegrations, refetchMapping } = useStoreManagementState()

    const connectMutationOptions = {
        onSuccess: () => {
            toast.success(
                'Store is successfully deleted. It may take a minute for all channels and features to disconnect.',
            )
            refetchIntegrations()
            refetchMapping()
            history.push('/app/settings/store-management')
        },
        onError: () => {
            toast.error('Failed to delete integration')
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
