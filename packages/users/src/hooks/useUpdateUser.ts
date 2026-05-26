import { patchInfiniteListCache } from '@repo/api-resources'
import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useUpdateUser as useUpdateUserPrimitive,
} from '@gorgias/helpdesk-queries'
import type { User } from '@gorgias/helpdesk-queries'

export function useUpdateUser(): ReturnType<typeof useUpdateUserPrimitive> {
    const queryClient = useQueryClient()
    return useUpdateUserPrimitive({
        mutation: {
            onSuccess: (response) => {
                const updated = response.data
                patchInfiniteListCache<User>({
                    queryClient,
                    queryKey: queryKeys.users.listAllUsers(),
                    match: (user) => user.id === updated.id,
                    patch: () => updated,
                })
            },
        },
    })
}
