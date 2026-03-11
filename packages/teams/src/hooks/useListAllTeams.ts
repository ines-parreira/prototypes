import { useExhaustEndpoint } from '@repo/hooks'
import { DurationInMs } from '@repo/utils'

import { listTeams } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

type UseListAllTeamsParams = {
    enabled?: boolean
}

export function useListAllTeams({
    enabled = true,
}: UseListAllTeamsParams = {}) {
    return useExhaustEndpoint(
        queryKeys.teams.listTeams(),
        (cursor) => listTeams({ cursor, limit: 100 }),
        {
            enabled,
            staleTime: DurationInMs.OneDay,
            refetchOnWindowFocus: false,
        },
    )
}
