import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'

export const useStoreConfiguration = ({
    shopName,
    accountDomain,
    enabled,
    refetchOnWindowFocus = false,
}: {
    shopName: string
    accountDomain: string
    enabled?: boolean
    refetchOnWindowFocus?: boolean
}) => {
    const {
        isLoading: isStoreConfigurationLoading,
        data: storeConfigurationData,
        error,
        isFetched,
    } = useGetStoresConfigurationForAccount(
        {
            accountDomain,
        },
        {
            retry: 1,
            refetchOnWindowFocus: refetchOnWindowFocus,
            enabled: enabled ?? true,
        },
    )

    const storeConfiguration = storeConfigurationData?.storeConfigurations.find(
        (storeConfig) => storeConfig.storeName === shopName,
    )

    return {
        isLoading: isStoreConfigurationLoading,
        storeConfiguration,
        error,
        isFetched,
    }
}
