import { useUpdateIntegration } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'

export default function useStoreUpdater(refetchStore: () => void) {
    const { success, error } = useNotify()

    const connectMutationOptions = {
        onSuccess: () => {
            success('Integration successfully updated')
            refetchStore()
        },
        onError: () => {
            error('Failed to update connection')
        },
    }

    const { mutate: updateIntegration, isLoading: isUpdating } =
        useUpdateIntegration({
            mutation: connectMutationOptions,
        })

    return {
        updateIntegration,
        isUpdating,
    }
}
