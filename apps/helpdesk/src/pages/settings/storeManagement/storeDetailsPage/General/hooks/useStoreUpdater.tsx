import { toast } from '@gorgias/axiom'
import { useUpdateIntegration } from '@gorgias/helpdesk-queries'

export function useStoreUpdater(refetchStore: () => void) {
    const connectMutationOptions = {
        onSuccess: () => {
            toast.success('Integration successfully updated')
            refetchStore()
        },
        onError: () => {
            toast.error('Failed to update connection')
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
