import {
    useGetFileIngestion,
    useGetHelpCenterList,
} from 'models/helpCenter/queries'

export const useFetchFileIngestionData = (
    storeName: string,
    enabled: boolean
) => {
    const {data: snippetHelpCenterData, isLoading: isLoadingHelpCenter} =
        useGetHelpCenterList(
            {
                type: 'snippet',
                per_page: 1,
                shop_name: storeName,
            },
            {enabled}
        )

    const snippetHelpCenterId = snippetHelpCenterData?.data?.data[0]?.id

    const {data, isLoading} = useGetFileIngestion(
        {
            help_center_id: snippetHelpCenterId!,
        },
        {
            enabled: !!snippetHelpCenterId,
        }
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
