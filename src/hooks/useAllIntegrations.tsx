import { listIntegrations } from '@gorgias/api-client'
import { queryKeys } from '@gorgias/api-queries'

import { useExhaustEndpoint } from './useExhaustEndpoint'

export default function useAllIntegrations() {
    const { data: integrations, isLoading } = useExhaustEndpoint(
        queryKeys.integrations.listIntegrations(),
        (cursor) => listIntegrations({ cursor, limit: 100 }),
    )

    return {
        integrations,
        isLoading,
    }
}
