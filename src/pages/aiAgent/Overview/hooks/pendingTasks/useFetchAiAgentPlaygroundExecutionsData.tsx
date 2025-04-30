import { useGetPlaygroundExecutions } from 'models/aiAgent/queries'

type Args = {
    accountDomain: string
    storeName: string
    enabled: boolean
    refetchOnWindowFocus?: boolean
}
export const useFetchAiAgentPlaygroundExecutionsData = ({
    accountDomain,
    storeName,
    enabled,
    refetchOnWindowFocus = true,
}: Args) => {
    const { data, isLoading, isFetched } = useGetPlaygroundExecutions(
        {
            accountDomain,
            storeName,
        },
        { enabled, refetchOnWindowFocus },
    )

    return {
        data: data?.data,
        isLoading,
        isFetched,
    }
}

export type AiAgentPlaygroundExecutionsData = Exclude<
    ReturnType<typeof useFetchAiAgentPlaygroundExecutionsData>['data'],
    null | undefined
>
