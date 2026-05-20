import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useCreateCustomFieldCondition as useCreate,
} from '@gorgias/helpdesk-queries'

import { isGorgiasApiError } from 'models/api/types'

/**
 * Wrapper for the SDK's useCreateCustomFieldCondition method that:
 * - Query invalidation
 * - Notifications
 */
export default function useCreateCustomFieldCondition() {
    const queryClient = useQueryClient()

    return useCreate({
        mutation: {
            onSuccess: () => {
                const queryKey =
                    queryKeys.customFieldConditions.listCustomFieldConditions()
                void queryClient.invalidateQueries({ queryKey })

                toast.success('Condition created successfully')
            },
            onError: (error) => {
                toast.error(
                    isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Failed to create condition',
                )
            },
        },
    })
}
