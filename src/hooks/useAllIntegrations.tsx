import { useEffect, useState } from 'react'

import { listIntegrations } from '@gorgias/helpdesk-client'
import { Integration, queryKeys } from '@gorgias/helpdesk-queries'

import { useExhaustEndpoint } from './useExhaustEndpoint'

export default function useAllIntegrations() {
    const [allIntegrations, setAllIntegrations] = useState<Integration[]>([])

    const { data, isLoading, refetch } = useExhaustEndpoint(
        queryKeys.integrations.listIntegrations(),
        (cursor) => listIntegrations({ cursor, limit: 100 }),
    )

    useEffect(() => {
        // prevent a reset of values on next fetch after window focus
        // until useExhaustEndpoint is enhanced to received react-query params
        if (data.length) {
            setAllIntegrations(data)
        }
    }, [data])

    return {
        integrations: allIntegrations,
        refetch,
        isLoading,
    }
}
