import {useCallback} from 'react'
import {useQueryClient} from '@tanstack/react-query'
import {
    useUpsertStoreApps,
    storeWorkFlowsAppDefinitionKeys,
} from 'models/workflows/queries'

import {Integration} from 'models/integration/types'
import {ActionApps} from '../types'

type Props = {
    storeName: string
    storeType: string
    appType?: ActionApps['type']
    integration?: Integration
}

export default function useAddStoreApp({
    storeName,
    storeType,
    integration,
}: Props) {
    const queryClient = useQueryClient()

    const queryKey = storeWorkFlowsAppDefinitionKeys.all()

    const {mutateAsync} = useUpsertStoreApps({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey,
            })
        },
    })

    const addStoreApp = useCallback(async () => {
        if (storeType !== 'shopify') {
            throw new Error('Unsupported store type')
        }

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

    return addStoreApp
}
