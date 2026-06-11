import { Duration } from '@gorgias/toolkit'

import { useListAllIntegrations } from '@gorgias/helpdesk-queries'
import type { Integration } from '@gorgias/helpdesk-queries'

export const INTEGRATIONS_PAGE_LIMIT = 100

const INTEGRATION_QUERY_OPTIONS = {
    staleTime: Duration.hours(4),
    refetchOnWindowFocus: false,
} as const

export function useAllIntegrations(): Integration[] {
    const { items } = useListAllIntegrations(
        { limit: INTEGRATIONS_PAGE_LIMIT },
        {
            exhaustPages: true,
            query: INTEGRATION_QUERY_OPTIONS,
        },
    )
    return items
}
