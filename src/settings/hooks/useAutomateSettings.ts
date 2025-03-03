import { useCallback, useEffect, useMemo } from 'react'
import type { ChangeEvent } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

export const BASE_PATH = '/app/settings/automate'

export function useAutomateSettings() {
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

    const handleChangeIntegration = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const integrationId = parseInt(e.currentTarget.value, 10)
            const integration = sortedIntegrations.find(
                (i) => i.id === integrationId,
            )
            if (!integration) return

            history.push(
                `${BASE_PATH}/${integration.type}/${integration.name}/flows`,
            )
        },
        [history, sortedIntegrations],
    )

    useEffect(() => {
        if (shopName || !sortedIntegrations.length) return
        const integration = sortedIntegrations[0]
        history.replace(
            `${BASE_PATH}/${integration.type}/${integration.name}/flows`,
        )
    }, [history, shopName, sortedIntegrations])

    return useMemo(
        () => ({
            integrations: sortedIntegrations,
            onChangeIntegration: handleChangeIntegration,
            selected,
        }),
        [handleChangeIntegration, selected, sortedIntegrations],
    )
}
