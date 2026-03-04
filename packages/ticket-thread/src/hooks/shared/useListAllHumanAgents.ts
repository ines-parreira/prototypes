import { useExhaustEndpoint } from '@repo/hooks'
import { DurationInMs } from '@repo/utils'

import { listUsers } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useListAllHumanAgents() {
    return useExhaustEndpoint(
        queryKeys.users.listUsers(),
        (cursor) => listUsers({ cursor, limit: 100 }),
        {
            staleTime: DurationInMs.OneDay,
            refetchOnWindowFocus: false,
        },
    )
}
