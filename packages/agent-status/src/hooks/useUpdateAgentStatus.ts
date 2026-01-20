import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useUpdateCustomUserAvailabilityStatus as useUpdatePrimitive,
} from '@gorgias/helpdesk-queries'

export function useUpdateAgentStatus() {
    const queryClient = useQueryClient()
    return useUpdatePrimitive({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey:
                        queryKeys.customUserAvailabilityStatus.listCustomUserAvailabilityStatuses(),
                })
            },
        },
    })
}
