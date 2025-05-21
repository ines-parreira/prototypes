import {
    useGetFileIngestion,
    useGetHelpCenterList,
} from 'models/helpCenter/queries'

type UseFetchFileIngestionArgs = {
    storeName: string
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    retries?: boolean
}

export const useFetchFileIngestionData = ({
    storeName,
    enabled = true,
    refetchOnWindowFocus = true,
    retries = true,
}: UseFetchFileIngestionArgs) => {
    const {
        data: snippetHelpCenterData,
        isLoading: isLoadingHelpCenter,
        isFetched: isFetchedHelpCenter,
    } = useGetHelpCenterList(
        {
            type: 'snippet',
            per_page: 1,
            shop_name: storeName,
        },
        { enabled, refetchOnWindowFocus, ...(!retries && { retry: 0 }) },
    )

    const snippetHelpCenterId = snippetHelpCenterData?.data?.data[0]?.id

    const { data, isLoading, isFetched } = useGetFileIngestion(
        {
            help_center_id: snippetHelpCenterId!,
        },
        {
            enabled: !!snippetHelpCenterId,
            refetchOnWindowFocus,
            ...(!retries && { retry: 0 }),
        },
    )

    return {
        data: data?.data,
        isLoading: isLoading || isLoadingHelpCenter,
        isFetched: isFetched || isFetchedHelpCenter,
    }
}

export type FileIngestionData = Exclude<
    ReturnType<typeof useFetchFileIngestionData>['data'],
    null | undefined
>
