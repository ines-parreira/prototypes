import { useCallback, useEffect, useMemo } from 'react'

import { useHistory, useLocation, useParams } from 'react-router-dom'

import type { IntegrationType } from 'models/integration/constants'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

export function useStoreSelector(basePath: string, types?: IntegrationType[]) {
    const history = useHistory()
    const location = useLocation()
    const { shopName, shopType } = useParams<{
        shopName?: string
        shopType?: string
        [key: string]: string | undefined
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
            if (!integration || !shopName || !shopType) return

            const name = getShopNameFromStoreIntegration(integration)

            const isFlowsRoute =
                location.pathname.includes('app/settings/flows')
            const flowsRouteExceptions = [
                'edit',
                'templates',
                'new',
                'analytics',
            ]
            const shouldRedirectToBaseRoute =
                isFlowsRoute &&
                flowsRouteExceptions.some((exception) =>
                    location.pathname.includes(exception),
                )

            if (shouldRedirectToBaseRoute) {
                history.push(`${basePath}/${integration.type}/${name}`)
                return
            }

            const nextURL = location.pathname
                .replace(shopType, integration.type)
                .replace(shopName, name)

            history.push(nextURL)
        },
        [
            history,
            location.pathname,
            shopName,
            shopType,
            sortedIntegrations,
            basePath,
        ],
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
