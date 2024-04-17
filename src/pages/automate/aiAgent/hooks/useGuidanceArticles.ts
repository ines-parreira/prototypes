import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'

export const useGuidanceArticles = (helpCenterId: number) => {
    const {data, isLoading} = useGetHelpCenterArticleList(
        helpCenterId,
        {
            version_status: 'latest_draft',
        },
        {
            refetchOnWindowFocus: false,
        }
    )

    return {guidanceArticles: data?.data, isLoading}
}
