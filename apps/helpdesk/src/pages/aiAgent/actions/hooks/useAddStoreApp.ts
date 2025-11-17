import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { Integration } from 'models/integration/types'
import {
    storeWorkflowsAppDefinitionKeys,
    useUpsertStoreApps,
} from 'models/workflows/queries'

type Props = {
    storeName: string
    storeType: 'shopify'
    integration?: Integration
}

export default function useAddStoreApp({
    storeName,
    storeType,
    integration,
}: Props) {
    const queryClient = useQueryClient()

    const queryKey = storeWorkflowsAppDefinitionKeys.all()

    const { mutateAsync } = useUpsertStoreApps({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey,
            })
        },
    })

    return useCallback(async () => {
        if (!integration || integration.type !== 'recharge') {
            return
        }

        await mutateAsync([
            {
                store_name: storeName,
                store_type: storeType,
                type: integration.type,
            },
            {
                integration_id: integration.id,
            },
        ])
    }, [integration, mutateAsync, storeName, storeType])
}
