import { useExhaustEndpoint } from '@repo/hooks'

import { listIntegrations } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

export function useShopifyIntegrations() {
    const queryParams = { limit: 100, type: 'shopify' as const }

    const { data, isLoading } = useExhaustEndpoint(
        queryKeys.integrations.listIntegrations(queryParams),
        (cursor) => listIntegrations({ cursor, ...queryParams }),
        { refetchOnWindowFocus: false },
    )

    return {
        integrations: data,
        isLoading,
    }
}
