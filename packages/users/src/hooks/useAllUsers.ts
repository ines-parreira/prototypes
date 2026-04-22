import { useListAllUsers } from '@gorgias/helpdesk-queries'
import type { User } from '@gorgias/helpdesk-queries'

import { USER_QUERY_OPTIONS } from './userQueryOptions'

export const USERS_PAGE_LIMIT = 100

export function useAllUsers(): User[] {
    const { items } = useListAllUsers(
        { limit: USERS_PAGE_LIMIT },
        {
            exhaustPages: true,
            query: USER_QUERY_OPTIONS,
        },
    )
    return items
}
