import { FormEvent, useCallback, useState } from 'react'

import { ShopifyIntegration } from 'models/integration/types'

import useStoreUpdater from './useStoreUpdater'

interface UseShopifySettingsFormProps {
    integration: ShopifyIntegration
    onShowConfirmation: () => void
    refetchStore: () => void
}

export function useShopifySettingsForm({
    integration,
    onShowConfirmation,
    refetchStore,
}: UseShopifySettingsFormProps) {
    const integrationSyncCustomerNotes =
        integration?.meta?.sync_customer_notes ?? false
    const integrationDefaultAddressPhoneMatchingEnabled =
        integration?.meta?.default_address_phone_matching_enabled ?? false

    const { updateIntegration, isUpdating: isSubmitting } =
        useStoreUpdater(refetchStore)

    const [syncCustomerNotes, setSyncCustomerNotes] = useState<boolean>(
        integrationSyncCustomerNotes,
    )
    const [
        defaultAddressPhoneMatchingEnabled,
        setDefaultAddressPhoneMatchingEnabled,
    ] = useState<boolean>(integrationDefaultAddressPhoneMatchingEnabled)

    const saveIntegrationMeta = useCallback(async () => {
        updateIntegration({
            id: integration.id,
            data: {
                name: integration.name,
                meta: {
                    ...integration.meta,
                    sync_customer_notes: syncCustomerNotes,
                    default_address_phone_matching_enabled:
                        defaultAddressPhoneMatchingEnabled,
                },
            },
        })
    }, [
        updateIntegration,
        integration,
        syncCustomerNotes,
        defaultAddressPhoneMatchingEnabled,
    ])

    const handleUpdate = useCallback(
        async (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()

            const isDefaultAddressPhoneMatchingBeingEnabled =
                defaultAddressPhoneMatchingEnabled &&
                integrationDefaultAddressPhoneMatchingEnabled !==
                    defaultAddressPhoneMatchingEnabled

            if (isDefaultAddressPhoneMatchingBeingEnabled) {
                onShowConfirmation()
            } else {
                await saveIntegrationMeta()
            }
        },
        [
            onShowConfirmation,
            saveIntegrationMeta,
            defaultAddressPhoneMatchingEnabled,
            integrationDefaultAddressPhoneMatchingEnabled,
        ],
    )

    const handleCancel = useCallback(() => {
        setSyncCustomerNotes(integrationSyncCustomerNotes)
        setDefaultAddressPhoneMatchingEnabled(
            integrationDefaultAddressPhoneMatchingEnabled,
        )
    }, [
        integrationSyncCustomerNotes,
        integrationDefaultAddressPhoneMatchingEnabled,
    ])

    const areIntegrationOptionsDirty =
        integrationSyncCustomerNotes !== syncCustomerNotes ||
        integrationDefaultAddressPhoneMatchingEnabled !==
            defaultAddressPhoneMatchingEnabled

    return {
        syncCustomerNotes,
        setSyncCustomerNotes,
        defaultAddressPhoneMatchingEnabled,
        setDefaultAddressPhoneMatchingEnabled,
        isSubmitting,
        handleUpdate,
        handleCancel,
        areIntegrationOptionsDirty,
        saveIntegrationMeta,
    }
}
