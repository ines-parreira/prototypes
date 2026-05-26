import { patchInfiniteListCache } from '@repo/api-resources'
import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateUser as useCreateUserPrimitive,
} from '@gorgias/helpdesk-queries'
import type { User } from '@gorgias/helpdesk-queries'

export function useCreateUser(): ReturnType<typeof useCreateUserPrimitive> {
    const queryClient = useQueryClient()
    return useCreateUserPrimitive({
        mutation: {
            onSuccess: (response) => {
                const created = response.data
                patchInfiniteListCache<User>({
                    queryClient,
                    queryKey: queryKeys.users.listAllUsers(),
                    match: (user) => user.id === created.id,
                    patch: () => created,
                    insert: created,
                })
            },
        },
    })
}
