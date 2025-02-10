import {useGetStoreConfigurationPure} from 'models/aiAgent/queries'

type Args = {
    accountDomain: string
    storeName: string
    enabled: boolean
}
export const useFetchAiAgentStoreConfigurationData = ({
    accountDomain,
    storeName,
    enabled,
}: Args) => {
    const {data, isLoading} = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName,
        },
        {enabled}
    )

    return {
        data: data?.data.storeConfiguration,
        isLoading,
    }
}

export type AiAgentStoreConfigurationData = Exclude<
    ReturnType<typeof useFetchAiAgentStoreConfigurationData>['data'],
    null | undefined
>
