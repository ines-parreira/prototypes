import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import type { User } from '@gorgias/helpdesk-queries'

import { USER_QUERY_OPTIONS } from './userQueryOptions'

export function useCurrentUser(): User | undefined {
    const { data } = useGetCurrentUser({
        query: {
            select: (response) => response.data,
            ...USER_QUERY_OPTIONS,
        },
    })
    return data
}
