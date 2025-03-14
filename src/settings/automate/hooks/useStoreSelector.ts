import { useCallback, useEffect, useMemo } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

export function useStoreSelector(basePath: string, types?: IntegrationType[]) {
    const history = useHistory()
    const { shopName } = useParams<{
        shopName?: string
    }>()

    const integrations = useStoreIntegrations(types)

    const sortedIntegrations = useMemo(
        () => [...integrations].sort((a, b) => a.name.localeCompare(b.name)),
        [integrations],
    )

    const selected = useMemo(
        () =>
            sortedIntegrations.find(
                (integration) =>
                    getShopNameFromStoreIntegration(integration) === shopName,
            ),
        [shopName, sortedIntegrations],
    )

    const handleChange = useCallback(
        (value: number) => {
            const integration = sortedIntegrations.find((i) => i.id === value)
            if (!integration) return

            const name = getShopNameFromStoreIntegration(integration)
            history.push(`${basePath}/${integration.type}/${name}`)
        },
        [basePath, history, sortedIntegrations],
    )

    useEffect(() => {
        if (shopName || !sortedIntegrations.length) return
        const integration = sortedIntegrations[0]
        const name = getShopNameFromStoreIntegration(integration)
        history.replace(`${basePath}/${integration.type}/${name}`)
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
