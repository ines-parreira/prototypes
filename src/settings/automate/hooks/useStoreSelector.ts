import { useCallback, useEffect, useMemo } from 'react'
import type { ChangeEvent } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

export function useStoreSelector(basePath: string) {
    const history = useHistory()
    const { shopName } = useParams<{
        shopName?: string
    }>()

    const integrations = useStoreIntegrations()
    const sortedIntegrations = useMemo(
        () => [...integrations].sort((a, b) => a.name.localeCompare(b.name)),
        [integrations],
    )

    const selected = useMemo(
        () =>
            sortedIntegrations.find(
                (integration) => integration.name === shopName,
            ),
        [shopName, sortedIntegrations],
    )

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const integrationId = parseInt(e.currentTarget.value, 10)
            const integration = sortedIntegrations.find(
                (i) => i.id === integrationId,
            )
            if (!integration) return

            history.push(`${basePath}/${integration.type}/${integration.name}`)
        },
        [basePath, history, sortedIntegrations],
    )

    useEffect(() => {
        if (shopName || !sortedIntegrations.length) return
        const integration = sortedIntegrations[0]
        history.replace(`${basePath}/${integration.type}/${integration.name}`)
    }, [basePath, history, shopName, sortedIntegrations])

    return useMemo(
        () => ({
            integrations: sortedIntegrations,
            onChange: handleChange,
            selected,
        }),
        [handleChange, selected, sortedIntegrations],
    )
}
