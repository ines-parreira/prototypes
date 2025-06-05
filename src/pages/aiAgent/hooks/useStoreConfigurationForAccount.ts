import { useMemo } from 'react'

import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'

export const useStoreConfigurationForAccount = ({
    accountDomain,
    storesName,
    enabled,
}: {
    accountDomain: string
    storesName?: string[]
    enabled?: boolean
}) => {
    const {
        isLoading: isStoreConfigurationLoading,
        data,
        error,
    } = useGetStoresConfigurationForAccount(
        { accountDomain },
        { retry: 1, refetchOnWindowFocus: false, enabled: enabled ?? true },
    )

    const storeConfigurations = useMemo(() => {
        const storeNameSet = new Set(storesName ?? [])

        return data?.storeConfigurations?.filter((item) =>
            storeNameSet.size > 0 ? storeNameSet.has(item.storeName) : true,
        )
    }, [data?.storeConfigurations, storesName])

    return {
        isLoading: isStoreConfigurationLoading && !error,
        storeConfigurations,
    }
}
