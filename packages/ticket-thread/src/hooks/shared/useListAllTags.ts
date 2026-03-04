import { useExhaustEndpoint } from '@repo/hooks'
import { DurationInMs } from '@repo/utils'

import { listTags } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useListAllTags() {
    return useExhaustEndpoint(
        queryKeys.tags.listTags(),
        (cursor) => listTags({ cursor, limit: 100 }),
        {
            staleTime: DurationInMs.OneDay,
            refetchOnWindowFocus: false,
        },
    )
}
