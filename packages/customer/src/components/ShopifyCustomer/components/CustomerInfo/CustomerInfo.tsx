import { useEffect, useState } from 'react'

import { useShopifyIntegrations } from '../../hooks'
import { StorePicker } from '../StorePicker'

type Props = {
    onStoreChange?: (integrationId: number) => void
}

export function CustomerInfo({ onStoreChange }: Props) {
    const { integrations, isLoading } = useShopifyIntegrations()
    const [selectedIntegrationId, setSelectedIntegrationId] = useState<
        number | undefined
    >()

    useEffect(() => {
        if (integrations.length > 0 && !selectedIntegrationId) {
            const firstIntegrationId = integrations[0].id
            setSelectedIntegrationId(firstIntegrationId)
            onStoreChange?.(firstIntegrationId)
        }
    }, [integrations, selectedIntegrationId, onStoreChange])

    const handleStoreChange = (integrationId: number) => {
        setSelectedIntegrationId(integrationId)
        onStoreChange?.(integrationId)
    }

    return (
        <>
            <StorePicker
                integrations={integrations}
                selectedIntegrationId={selectedIntegrationId}
                onChange={handleStoreChange}
                isLoading={isLoading}
            />
        </>
    )
}
