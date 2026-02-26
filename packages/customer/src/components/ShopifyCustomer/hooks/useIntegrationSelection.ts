import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useTicketInfobarNavigation } from '@repo/navigation'

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
    const { shopifyIntegrationId } = useTicketInfobarNavigation()
    const { integrations, isLoading } = useShopifyIntegrations()
    const [selectedIntegration, setSelectedIntegration] = useState<
        Integration | undefined
    >()
    const hasInitialized = useRef(false)

    const filteredIntegrations = useMemo(
        () =>
            integrations.filter((i) => associatedShopifyCustomerIds.has(i.id)),
        [integrations, associatedShopifyCustomerIds],
    )

    const selectedExternalId = selectedIntegration?.id
        ? externalIdMap.get(selectedIntegration.id)
        : undefined

    useEffect(() => {
        if (filteredIntegrations.length > 0 && !hasInitialized.current) {
            const preferred =
                shopifyIntegrationId != null
                    ? filteredIntegrations.find(
                          (i) => i.id === shopifyIntegrationId,
                      )
                    : undefined
            const integration = preferred ?? filteredIntegrations[0]
            setSelectedIntegration(integration)
            onStoreChange?.(integration.id)
            hasInitialized.current = true
        }
    }, [filteredIntegrations, onStoreChange, shopifyIntegrationId])

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
