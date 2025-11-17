import { useCallback } from 'react'

import type { Magento2Integration } from 'models/integration/types'

import useStoreUpdater from '../../hooks/useStoreUpdater'

interface useMagentoSettingsFormProps {
    integration: Magento2Integration
    refetchStore: () => void
}

interface FormValues {
    adminURLSuffix: string
    consumerKey: string
    consumerSecret: string
    accessToken: string
    accessTokenSecret: string
}

export function useManualForm({
    integration,
    refetchStore,
}: useMagentoSettingsFormProps) {
    const { updateIntegration, isUpdating: isSubmitting } =
        useStoreUpdater(refetchStore)

    const handleUpdate = useCallback(
        async (values: FormValues) => {
            const anySecret = [
                values.consumerKey,
                values.consumerSecret,
                values.accessToken,
                values.accessTokenSecret,
            ].some(Boolean)

            const auth = anySecret
                ? {
                      consumer_key: values.consumerKey,
                      consumer_secret: values.consumerSecret,
                      oauth_token: values.accessToken,
                      oauth_token_secret: values.accessTokenSecret,
                  }
                : null

            updateIntegration({
                id: integration.id,
                data: {
                    name: integration.name,
                    ...(auth && { connections: [{ data: auth }] }),
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
            adminURLSuffix: integration.meta.admin_url_suffix || '',
            consumerKey: '',
            consumerSecret: '',
            accessToken: '',
            accessTokenSecret: '',
        },
        isSubmitting,
        handleUpdate,
        storeURL: integration.meta.store_url,
    }
}
