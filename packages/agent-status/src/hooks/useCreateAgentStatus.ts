import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateCustomUserAvailabilityStatus as useCreatePrimitive,
} from '@gorgias/helpdesk-queries'

export function useCreateAgentStatus() {
    const queryClient = useQueryClient()
    return useCreatePrimitive({
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
