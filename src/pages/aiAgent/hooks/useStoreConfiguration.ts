import {useGetStoreConfigurationPure} from 'models/aiAgent/queries'

export const useStoreConfiguration = ({
    shopName,
    accountDomain,
    withWizard,
}: {
    shopName: string
    accountDomain: string
    withWizard?: boolean
}) => {
    const {
        isLoading: isStoreConfigurationLoading,
        data: storeConfigurationData,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName: shopName,
            withWizard,
        },
        {retry: 1, refetchOnWindowFocus: false}
    )

    return {
        isLoading: isStoreConfigurationLoading,
        storeConfiguration: storeConfigurationData?.data.storeConfiguration,
    }
}
