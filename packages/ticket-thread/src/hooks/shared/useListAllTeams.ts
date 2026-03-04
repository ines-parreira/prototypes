import { useExhaustEndpoint } from '@repo/hooks'
import { DurationInMs } from '@repo/utils'

import { listTeams } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useListAllTeams() {
    return useExhaustEndpoint(
        queryKeys.teams.listTeams(),
        (cursor) => listTeams({ cursor, limit: 100 }),
        {
            staleTime: DurationInMs.OneDay,
            refetchOnWindowFocus: false,
        },
    )
}
