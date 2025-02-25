import { useMemo } from 'react'

import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { StoreConfiguration } from 'models/aiAgent/types'

export const useStoreConfigurationForAccount = ({
    accountDomain,
    storesName,
    withWizard,
    enabled,
}: {
    accountDomain: string
    storesName: string[]
    withWizard?: boolean
    enabled?: boolean
}) => {
    const {
        isLoading: isStoreConfigurationLoading,
        data: storeConfigurationResponses,
    } = useGetStoresConfigurationForAccount(
        {
            accountDomain,
            storesName,
            withWizard,
        },
        { retry: 1, refetchOnWindowFocus: false, enabled: enabled ?? true },
    )

    const storeConfigurations = useMemo(() => {
        return storeConfigurationResponses
            ?.map(
                (storeConfigurationResponse) =>
                    storeConfigurationResponse.data?.storeConfiguration,
            )
            .filter(
                (
                    storeConfiguration,
                ): storeConfiguration is StoreConfiguration =>
                    !!storeConfiguration,
            )
    }, [storeConfigurationResponses])

    return {
        isLoading: isStoreConfigurationLoading,
        storeConfigurations,
    }
}
