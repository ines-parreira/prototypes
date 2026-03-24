import { useCallback } from 'react'

import { reportError } from '@repo/logging'
import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    helpCenterKeys,
    useDeleteArticleIngestionLog,
    useStartIngestion,
} from 'models/helpCenter/queries'

export const usePublicResourceMutation = ({
    helpCenterId,
}: {
    helpCenterId: number
}) => {
    const queryClient = useQueryClient()

    const onIngestionSuccess = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: helpCenterKeys.articleIngestionLogs(helpCenterId),
        })
        await queryClient.invalidateQueries({
            queryKey: helpCenterKeys.articleIngestionLogsListRoot(),
        })
        await queryClient.invalidateQueries({
            queryKey: helpCenterKeys.knowledgeStatus(),
        })
    }, [queryClient, helpCenterId])

    const { mutateAsync: startIngestionAsync } = useStartIngestion({
        onSuccess: onIngestionSuccess,
    })

    const addPublicResource = async (url: string) => {
        try {
            await startIngestionAsync([
                undefined,
                { help_center_id: helpCenterId },
                { url, type: 'url' },
            ])
        } catch (error) {
            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context: 'Error during ingestion start',
                    url,
                },
            })

            throw error
        }
    }

    const { mutateAsync: deleteArticleIngestionLogAsync } =
        useDeleteArticleIngestionLog({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.articleIngestionLogs(helpCenterId),
                })
                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.articleIngestionLogsListRoot(),
                })
                await queryClient.invalidateQueries({
                    queryKey: helpCenterKeys.knowledgeStatus(),
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
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context: 'Error during article ingestion log deleting',
                },
            })

            throw error
        }
    }

    return { addPublicResource, deletePublicResource }
}
