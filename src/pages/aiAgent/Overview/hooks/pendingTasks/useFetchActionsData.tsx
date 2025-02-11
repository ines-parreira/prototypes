import {useGetStoreWorkflowsConfigurations} from 'models/workflows/queries'

type Args = {
    storeName: string
    enabled: boolean
}

export const useFetchActionsData = ({enabled, storeName}: Args) => {
    const {data, isLoading} = useGetStoreWorkflowsConfigurations(
        {
            storeName,
            storeType: 'shopify',
            triggers: ['llm-prompt'],
        },
        {enabled}
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
