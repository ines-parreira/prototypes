import { useGetStoreConfigurationPure } from 'models/aiAgent/queries'

type Args = {
    accountDomain: string
    storeName: string
    enabled: boolean
    refetchOnWindowFocus?: boolean
}
export const useFetchAiAgentStoreConfigurationData = ({
    accountDomain,
    storeName,
    enabled,
    refetchOnWindowFocus = true,
}: Args) => {
    const { data, isLoading, error, isFetched } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName,
            withFloatingInput: true,
        },
        { enabled, refetchOnWindowFocus },
    )

    return {
        data: data?.data.storeConfiguration,
        isLoading,
        error,
        isFetched,
    }
}

export type AiAgentStoreConfigurationData = Exclude<
    ReturnType<typeof useFetchAiAgentStoreConfigurationData>['data'],
    null | undefined
>
