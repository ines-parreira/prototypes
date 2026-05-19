import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

    const selectedIntegrationRef = useRef(selectedIntegration)
    selectedIntegrationRef.current = selectedIntegration

    const onStoreChangeRef = useRef(onStoreChange)
    onStoreChangeRef.current = onStoreChange

    useEffect(() => {
        if (filteredIntegrations.length === 0) return

        const isCurrentSelectionValid = filteredIntegrations.some(
            (i) => i.id === selectedIntegrationRef.current?.id,
        )

        if (!isCurrentSelectionValid) {
            const integration = filteredIntegrations[0]
            setSelectedIntegration(integration)
            onStoreChangeRef.current?.(integration.id)
        }
    }, [filteredIntegrations])

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
