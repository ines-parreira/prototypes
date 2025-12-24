import { useExhaustEndpoint } from '@repo/hooks'

import type { IntegrationType } from '@gorgias/helpdesk-client'
import { listIntegrations } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useAllIntegrations(type?: IntegrationType) {
    const queryParams = {
        limit: 100,
        type,
    }

    const { data, isLoading } = useExhaustEndpoint(
        queryKeys.integrations.listIntegrations(queryParams),
        (cursor) => listIntegrations({ cursor, ...queryParams }),
        { staleTime: 60_000, refetchOnWindowFocus: false },
    )

    return {
        integrations: data,
        isLoading,
    }
}
