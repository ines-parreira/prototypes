import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Integration } from '@gorgias/helpdesk-types'

import { useShopifyIntegrations } from './useShopifyIntegrations'

type Params = {
    associatedShopifyCustomerIds: Set<number>
    externalIdMap: Map<number, string>
    onStoreChange?: (integrationId: number) => void
}

export function useIntegrationSelection({
    associatedShopifyCustomerIds,
    externalIdMap,
    onStoreChange,
}: Params) {
    const { integrations, isLoading } = useShopifyIntegrations()
    const [selectedIntegration, setSelectedIntegration] = useState<
        Integration | undefined
    >()

    const filteredIntegrations = useMemo(
        () =>
            integrations.filter((i) => associatedShopifyCustomerIds.has(i.id)),
        [integrations, associatedShopifyCustomerIds],
    )

    const selectedExternalId = selectedIntegration?.id
        ? externalIdMap.get(selectedIntegration.id)
        : undefined

    useEffect(() => {
        if (filteredIntegrations.length > 0 && !selectedIntegration) {
            const firstIntegration = filteredIntegrations[0]
            setSelectedIntegration(firstIntegration)
            onStoreChange?.(firstIntegration.id)
        }
    }, [filteredIntegrations, selectedIntegration, onStoreChange])

    const handleStoreChange = useCallback(
        (integration: Integration) => {
            setSelectedIntegration(integration)
            onStoreChange?.(integration.id)
        },
        [onStoreChange],
    )

    return {
        filteredIntegrations,
        selectedIntegration,
        selectedExternalId,
        handleStoreChange,
        isLoading,
    }
}
