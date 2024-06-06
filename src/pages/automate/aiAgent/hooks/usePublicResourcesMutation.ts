import {useQueryClient} from '@tanstack/react-query'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {
    helpCenterStatsKeys,
    useDeleteArticleIngestionLog,
    useStartArticleIngestion,
} from 'models/helpCenter/queries'
import {reportError} from 'utils/errors'

export const usePublicResourceMutation = ({
    helpCenterId,
}: {
    helpCenterId: number
}) => {
    const queryClient = useQueryClient()

    const {mutateAsync: startArticleIngestionAsync} = useStartArticleIngestion({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey:
                    helpCenterStatsKeys.articleIngestionLogs(helpCenterId),
            })
        },
    })

    const addPublicResource = async (urls: string[]) => {
        const links = urls.map((url) => ({url}))
        try {
            await startArticleIngestionAsync([
                undefined,
                {help_center_id: helpCenterId},
                {links},
            ])
        } catch (error) {
            reportError(error, {
                tags: {team: AI_AGENT_SENTRY_TEAM},
                extra: {
                    context: 'Error during article ingestion start',
                    links,
                },
            })

            throw error
        }
    }

    const {mutateAsync: deleteArticleIngestionLogAsync} =
        useDeleteArticleIngestionLog({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey:
                        helpCenterStatsKeys.articleIngestionLogs(helpCenterId),
                })
            },
        })
    const deletePublicResource = async (articleIngestionId: number) => {
        try {
            await deleteArticleIngestionLogAsync([
                undefined,
                {
                    help_center_id: helpCenterId,
                    article_ingestion_log_id: articleIngestionId,
                },
            ])
        } catch (error) {
            reportError(error, {
                tags: {team: AI_AGENT_SENTRY_TEAM},
                extra: {
                    context: 'Error during article ingestion log deleting',
                },
            })

            throw error
        }
    }

    return {addPublicResource, deletePublicResource}
}
