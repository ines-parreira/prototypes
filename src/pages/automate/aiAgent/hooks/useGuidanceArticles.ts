import {useQueryClient} from '@tanstack/react-query'
import {
    helpCenterStatsKeys,
    useCreateArticle,
    useGetHelpCenterArticleList,
} from 'models/helpCenter/queries'
import {mapGuidanceToArticleApi} from '../utils/guidanceUtils'
import {GuidanceArticle} from '../types'
import {Paths} from '../../../../rest_api/help_center_api/client.generated'

const QUERY_PARAMS: Paths.ListArticles.QueryParameters = {
    version_status: 'latest_draft',
}

export const useGuidanceArticles = (helpCenterId: number) => {
    const queryClient = useQueryClient()
    const {data, isLoading: isGetArticleLoading} = useGetHelpCenterArticleList(
        helpCenterId,
        QUERY_PARAMS,
        {
            refetchOnWindowFocus: false,
        }
    )

    const {
        mutateAsync: createArticleMutateAsync,
        isLoading: isCreateArticleLoading,
    } = useCreateArticle({
        onSuccess: async () => {
            await queryClient.invalidateQueries([
                helpCenterStatsKeys.articleList(helpCenterId, QUERY_PARAMS),
            ])
        },
    })

    const createOrUpdateArticle = async (guidanceArticle: GuidanceArticle) => {
        const payload = mapGuidanceToArticleApi(guidanceArticle)

        try {
            await createArticleMutateAsync([
                undefined,
                {help_center_id: helpCenterId},
                payload,
            ])
        } catch (error) {
            console.error('Error during guidance article creation', error)
        }
    }

    return {
        guidanceArticles: data?.data,
        createOrUpdateArticle,
        isArticleListLoading: isGetArticleLoading,
        isArticleLoading: isCreateArticleLoading,
    }
}
