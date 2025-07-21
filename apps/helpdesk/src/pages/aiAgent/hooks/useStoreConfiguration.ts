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

    return {
        isLoading: isStoreConfigurationLoading,
        storeConfiguration: storeConfigurationData?.storeConfigurations.find(
            (storeConfiguration) => storeConfiguration.storeName === shopName,
        ),
        error,
        isFetched,
    }
}
