import {useQueryClient} from '@tanstack/react-query'
import {useMemo} from 'react'
import {
    helpCenterStatsKeys,
    useCreateArticle,
    useDeleteArticle,
    useGetHelpCenterArticleList,
} from 'models/helpCenter/queries'
import {reportError} from 'utils/errors'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {
    mapArticleApiToGuidanceArticle,
    mapGuidanceToArticleApi,
} from '../utils/guidance.utils'
import {CreateGuidanceArticle} from '../types'
import {Paths} from '../../../../rest_api/help_center_api/client.generated'
import {GUIDANCE_ARTICLE_LIMIT} from '../constants'

const QUERY_PARAMS: Paths.ListArticles.QueryParameters = {
    version_status: 'latest_draft',
    per_page: GUIDANCE_ARTICLE_LIMIT, // Temp limit until pagination is implemented
}

export const useGuidanceArticles = (guidanceHelpCenterId: number) => {
    const queryClient = useQueryClient()

    const {data, isLoading: isGuidanceArticleListLoading} =
        useGetHelpCenterArticleList(guidanceHelpCenterId, QUERY_PARAMS, {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        })

    const guidanceArticles = useMemo(
        () => (data ? mapArticleApiToGuidanceArticle(data.data) : []),
        [data]
    )

    const {
        mutateAsync: createArticleMutateAsync,
        isLoading: isGuidanceArticleUpdating,
    } = useCreateArticle({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: helpCenterStatsKeys.articles(
                    guidanceHelpCenterId,
                    QUERY_PARAMS
                ),
            })
        },
    })

    const {
        mutateAsync: deleteArticleMutateAsync,
        isLoading: isGuidanceArticleDeleting,
    } = useDeleteArticle({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: helpCenterStatsKeys.articles(
                    guidanceHelpCenterId,
                    QUERY_PARAMS
                ),
            })
        },
    })

    const createOrUpdateGuidanceArticle = async (
        createGuidanceArticle: CreateGuidanceArticle
    ) => {
        const payload = mapGuidanceToArticleApi(createGuidanceArticle)

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

    const deleteGuidanceArticle = async (articleId: number) => {
        try {
            await deleteArticleMutateAsync([
                undefined,
                {id: articleId, help_center_id: guidanceHelpCenterId},
            ])
        } catch (error) {
            reportError(error, {
                extra: {
                    context: 'Error during guidance article deletion',
                    tags: [AI_AGENT_SENTRY_TEAM],
                },
            })
        }
    }

    return {
        guidanceArticles,
        deleteGuidanceArticle,
        isGuidanceArticleDeleting,
        createOrUpdateGuidanceArticle,
        isGuidanceArticleListLoading,
        isGuidanceArticleUpdating,
    }
}
