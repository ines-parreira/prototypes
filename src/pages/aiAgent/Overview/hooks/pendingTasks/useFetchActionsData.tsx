import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'

type Args = {
    storeName: string
    enabled: boolean
    refetchOnWindowFocus?: boolean
}

export const useFetchActionsData = ({
    enabled,
    storeName,
    refetchOnWindowFocus = true,
}: Args) => {
    const { data, isLoading } = useGetStoreWorkflowsConfigurations(
        {
            storeName,
            storeType: 'shopify',
            triggers: ['llm-prompt'],
        },
        { enabled, refetchOnWindowFocus },
    )

    return {
        data,
        isLoading,
    }
}

export type ActionsData = Exclude<
    ReturnType<typeof useFetchActionsData>['data'],
    null | undefined
>
