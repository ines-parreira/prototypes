import {UseQueryOptions, useQuery, useMutation} from '@tanstack/react-query'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {MutationOverrides} from 'types/query'
import {
    fetchSelfServiceConfigurationSSP,
    updateSelfServiceConfigurationSSP,
} from './resources'
import {SelfServiceConfiguration} from './types'
import {getShopNameFromStoreIntegration} from './utils'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

export const selfServiceConfigurationKeys = {
    all: () => ['selfServiceConfigurations'] as const,
    detail: (shopName: string | undefined, shopType: string | undefined) =>
        ['selfServiceConfigurations', shopName, shopType] as const,
}

export const useGetSelfServiceConfiguration = (
    shopType: string | undefined,
    shopName: string | undefined,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof fetchSelfServiceConfigurationSSP>>
    >
) => {
    return useQuery({
        queryKey: selfServiceConfigurationKeys.detail(shopName, shopType),
        queryFn: async () => {
            if (!shopName || !shopType) {
                throw new Error('Shop name and type are required')
            }
            return fetchSelfServiceConfigurationSSP(shopName, shopType)
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        enabled: Boolean(shopName && shopType),
        ...overrides,
    })
}

export const useGetSelfServiceConfigurations = (
    overrides?: UseQueryOptions<SelfServiceConfiguration[]>
) => {
    const integrations = useStoreIntegrations()

    return useQuery({
        queryKey: selfServiceConfigurationKeys.all(),
        queryFn: async () => {
            const configurations = await Promise.all(
                integrations.map((integration) =>
                    fetchSelfServiceConfigurationSSP(
                        getShopNameFromStoreIntegration(integration),
                        integration.type
                    )
                )
            )
            return configurations ?? []
        },
        ...overrides,
    })
}

export const useUpdateSelfServiceConfiguration = (
    overrides?: MutationOverrides<typeof updateSelfServiceConfigurationSSP>
) => {
    return useMutation({
        mutationFn: (params) => updateSelfServiceConfigurationSSP(...params),
        ...overrides,
    })
}
