import { useGetPlaygroundExecutions } from 'models/aiAgent/queries'

type Args = {
    accountDomain: string
    storeName: string
    enabled: boolean
}
export const useFetchAiAgentPlaygroundExecutionsData = ({
    accountDomain,
    storeName,
    enabled,
}: Args) => {
    const { data, isLoading } = useGetPlaygroundExecutions(
        {
            accountDomain,
            storeName,
        },
        { enabled },
    )

    return {
        data: data?.data,
        isLoading,
    }
}

export type AiAgentPlaygroundExecutionsData = Exclude<
    ReturnType<typeof useFetchAiAgentPlaygroundExecutionsData>['data'],
    null | undefined
>
