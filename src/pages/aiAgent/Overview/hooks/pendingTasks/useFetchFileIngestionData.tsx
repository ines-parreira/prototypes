import {
    useGetFileIngestion,
    useGetHelpCenterList,
} from 'models/helpCenter/queries'

type UseFetchFileIngestionArgs = {
    storeName: string
    enabled?: boolean
    refetchOnWindowFocus?: boolean
}

export const useFetchFileIngestionData = ({
    storeName,
    enabled = true,
    refetchOnWindowFocus = true,
}: UseFetchFileIngestionArgs) => {
    const { data: snippetHelpCenterData, isLoading: isLoadingHelpCenter } =
        useGetHelpCenterList(
            {
                type: 'snippet',
                per_page: 1,
                shop_name: storeName,
            },
            { enabled, refetchOnWindowFocus },
        )

    const snippetHelpCenterId = snippetHelpCenterData?.data?.data[0]?.id

    const { data, isLoading } = useGetFileIngestion(
        {
            help_center_id: snippetHelpCenterId!,
        },
        {
            enabled: !!snippetHelpCenterId,
            refetchOnWindowFocus,
        },
    )

    return {
        data: data?.data,
        isLoading: isLoading || isLoadingHelpCenter,
    }
}

export type FileIngestionData = Exclude<
    ReturnType<typeof useFetchFileIngestionData>['data'],
    null | undefined
>
