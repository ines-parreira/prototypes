import {useGetStoreConfigurationPure} from 'models/aiAgent/queries'

export const useStoreConfiguration = ({
    shopName,
    accountDomain,
}: {
    shopName: string
    accountDomain: string
}) => {
    const {
        isLoading: isStoreConfigurationLoading,
        data: storeConfigurationData,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName: shopName,
        },
        {retry: 1, refetchOnWindowFocus: false}
    )

    return {
        isLoading: isStoreConfigurationLoading,
        storeConfiguration: storeConfigurationData?.data.storeConfiguration,
    }
}
