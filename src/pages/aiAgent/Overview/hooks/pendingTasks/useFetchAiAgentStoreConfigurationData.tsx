import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'

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
    const {
        storeConfiguration: data,
        isLoading,
        error,
        isFetched,
    } = useStoreConfiguration({
        shopName: storeName,
        accountDomain,
        enabled,
        refetchOnWindowFocus,
    })

    return {
        data,
        isLoading,
        error,
        isFetched,
    }
}

export type AiAgentStoreConfigurationData = Exclude<
    ReturnType<typeof useFetchAiAgentStoreConfigurationData>['data'],
    null | undefined
>
