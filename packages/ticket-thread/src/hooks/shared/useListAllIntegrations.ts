import { useExhaustEndpoint } from '@repo/hooks'
import { DurationInMs } from '@repo/utils'

import { listIntegrations } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useListAllIntegrations() {
    return useExhaustEndpoint(
        queryKeys.integrations.listIntegrations(),
        (cursor) => listIntegrations({ cursor, limit: 100 }),
        {
            staleTime: DurationInMs.OneDay,
            refetchOnWindowFocus: false,
        },
    )
}
