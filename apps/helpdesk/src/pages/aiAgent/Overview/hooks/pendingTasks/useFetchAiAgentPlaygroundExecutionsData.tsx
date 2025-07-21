import { useGetPlaygroundExecutions } from 'models/aiAgent/queries'

type Args = {
    accountDomain: string
    storeName: string
    enabled: boolean
    refetchOnWindowFocus?: boolean
    retries?: boolean
}
export const useFetchAiAgentPlaygroundExecutionsData = ({
    accountDomain,
    storeName,
    enabled,
    refetchOnWindowFocus = true,
    retries = true,
}: Args) => {
    const { data, isLoading, isFetched } = useGetPlaygroundExecutions(
        {
            accountDomain,
            storeName,
        },
        { enabled, refetchOnWindowFocus, ...(!retries && { retry: 0 }) },
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
