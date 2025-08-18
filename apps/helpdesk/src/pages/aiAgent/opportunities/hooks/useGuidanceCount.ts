import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { Paths } from 'rest_api/help_center_api/client.generated'

interface UseGuidanceCountOptions {
    guidanceHelpCenterId: number
}

export const useGuidanceCount = ({
    guidanceHelpCenterId,
}: UseGuidanceCountOptions) => {
    const queryParams: Paths.ListArticles.QueryParameters = {
        version_status: 'latest_draft',
        per_page: 1,
    }

    const { data, isLoading } = useGetHelpCenterArticleList(
        guidanceHelpCenterId,
        queryParams,
        {
            refetchOnWindowFocus: false,
            staleTime: 10 * 60 * 1000, // 10 minutes in milliseconds
        },
    )

    return {
        guidanceCount: data?.meta.item_count || 0,
        isLoading,
    }
}
