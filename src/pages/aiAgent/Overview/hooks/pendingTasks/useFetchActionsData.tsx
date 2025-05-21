import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'

type Args = {
    storeName: string
    enabled: boolean
    refetchOnWindowFocus?: boolean
    retries?: boolean
}

export const useFetchActionsData = ({
    enabled,
    storeName,
    refetchOnWindowFocus = true,
    retries = true,
}: Args) => {
    const { data, isLoading, isFetched } = useGetStoreWorkflowsConfigurations(
        {
            storeName,
            storeType: 'shopify',
            triggers: ['llm-prompt'],
        },
        { enabled, refetchOnWindowFocus, ...(!retries && { retry: 0 }) },
    )

    return {
        data,
        isLoading,
        isFetched,
    }
}

export type ActionsData = Exclude<
    ReturnType<typeof useFetchActionsData>['data'],
    null | undefined
>
