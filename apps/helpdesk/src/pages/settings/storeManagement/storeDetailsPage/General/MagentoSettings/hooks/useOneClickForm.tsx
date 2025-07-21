import { useCallback } from 'react'

import { Magento2Integration } from 'models/integration/types'

import useStoreUpdater from '../../hooks/useStoreUpdater'

interface useMagentoSettingsFormProps {
    integration: Magento2Integration
    refetchStore: () => void
}

interface FormValues {
    adminURLSuffix: string
}

export function useOneClickForm({
    integration,
    refetchStore,
}: useMagentoSettingsFormProps) {
    const { updateIntegration, isUpdating: isSubmitting } =
        useStoreUpdater(refetchStore)

    const handleUpdate = useCallback(
        async (values: FormValues) => {
            updateIntegration({
                id: integration.id,
                data: {
                    name: integration.name,
                    meta: {
                        ...integration.meta,
                        admin_url_suffix: values.adminURLSuffix,
                    },
                },
            })
        },
        [updateIntegration, integration],
    )

    return {
        defaultValues: {
            adminURLSuffix: integration.meta.admin_url_suffix ?? '',
        },
        isSubmitting,
        handleUpdate,
        storeURL: integration.meta.store_url ?? '',
    }
}
