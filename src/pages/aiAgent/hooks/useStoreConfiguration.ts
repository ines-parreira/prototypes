import { useGetStoreConfigurationPure } from 'models/aiAgent/queries'

export const useStoreConfiguration = ({
    shopName,
    accountDomain,
    withWizard,
    withFloatingInput,
    enabled,
}: {
    shopName: string
    accountDomain: string
    withWizard?: boolean
    withFloatingInput?: boolean
    enabled?: boolean
}) => {
    const {
        isLoading: isStoreConfigurationLoading,
        data: storeConfigurationData,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName: shopName,
            withWizard,
            withFloatingInput,
        },
        { retry: 1, refetchOnWindowFocus: false, enabled: enabled ?? true },
    )

    return {
        isLoading: isStoreConfigurationLoading,
        storeConfiguration: storeConfigurationData?.data.storeConfiguration,
    }
}
