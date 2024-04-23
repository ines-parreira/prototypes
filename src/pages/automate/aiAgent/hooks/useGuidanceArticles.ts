import {useQueryClient} from '@tanstack/react-query'
import {
    helpCenterStatsKeys,
    useCreateArticle,
    useGetHelpCenterArticleList,
} from 'models/helpCenter/queries'
import {reportError} from 'utils/errors'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {mapGuidanceToArticleApi} from '../utils/guidanceUtils'
import {GuidanceArticle} from '../types'
import {Paths} from '../../../../rest_api/help_center_api/client.generated'

const QUERY_PARAMS: Paths.ListArticles.QueryParameters = {
    version_status: 'latest_draft',
}

export const useGuidanceArticles = (guidanceHelpCenterId: number) => {
    const queryClient = useQueryClient()

    const {data, isLoading: isGuidanceArticleListLoading} =
        useGetHelpCenterArticleList(guidanceHelpCenterId, QUERY_PARAMS, {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        })

    const {
        mutateAsync: createArticleMutateAsync,
        isLoading: isGuidanceArticleUpdating,
    } = useCreateArticle({
        onSuccess: async () => {
            await queryClient.invalidateQueries([
                helpCenterStatsKeys.articles(
                    guidanceHelpCenterId,
                    QUERY_PARAMS
                ),
            ])
        },
    })

    const createOrUpdateGuidanceArticle = async (
        guidanceArticle: GuidanceArticle
    ) => {
        const payload = mapGuidanceToArticleApi(guidanceArticle)

        try {
            await createArticleMutateAsync([
                undefined,
                {help_center_id: guidanceHelpCenterId},
                payload,
            ])
        } catch (error) {
            reportError(error, {
                extra: {
                    context: 'Error during guidance article creation',
                    tags: [AI_AGENT_SENTRY_TEAM],
                },
            })

            throw error
        }
    }

    return {
        guidanceArticles: data?.data,
        createOrUpdateGuidanceArticle,
        isGuidanceArticleListLoading,
        isGuidanceArticleUpdating,
    }
}
