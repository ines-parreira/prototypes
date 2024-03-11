import {useQuery} from '@tanstack/react-query'
import axios from 'axios'

import {notify} from 'state/notifications/actions'
import {
    CACHE_TIME_MS,
    STALE_TIME_MS,
    storeConfigurationKeys,
} from 'models/aiAgent/queries'
import {
    getStoreConfiguration,
    upsertStoreConfiguration,
} from 'models/aiAgent/resources'
import {NotificationStatus} from 'state/notifications/types'
import {StoreDispatch} from 'state/types'
import {DEFAULT_STORE_CONFIGURATION} from 'pages/automate/aiAgent/constants'

export function useGetOrCreateStoreConfiguration(params: {
    shopName: string
    enabled: boolean
    accountDomain: string
    dispatch: StoreDispatch
}) {
    const {shopName, enabled, accountDomain, dispatch} = params

    return useQuery({
        queryKey: storeConfigurationKeys.detail(shopName),
        enabled,
        queryFn: async () => {
            try {
                return await getStoreConfiguration({
                    accountDomain,
                    storeName: shopName,
                })
            } catch (error) {
                if (
                    !axios.isAxiosError(error) ||
                    error.response?.status !== 404
                ) {
                    throw error
                }

                void dispatch(
                    notify({
                        message: 'Initializing store configuration',
                        status: NotificationStatus.Loading,
                        closeOnNext: true,
                    })
                )

                // FIXME: 2. Use a POST request to create the store configuration when available
                const storeConfig = await upsertStoreConfiguration({
                    storeConfiguration: {
                        ...DEFAULT_STORE_CONFIGURATION,
                        storeName: shopName,
                    },
                    accountDomain,
                    storeName: shopName,
                })

                void dispatch(
                    notify({
                        message: `AI Agent successfully initialized for store ${shopName}`,
                        status: NotificationStatus.Success,
                    })
                )

                return storeConfig
            }
        },
        onError: () => {
            void dispatch(
                notify({
                    message:
                        'An error occurred while fetching the store configuration',
                    status: NotificationStatus.Error,
                })
            )
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })
}
