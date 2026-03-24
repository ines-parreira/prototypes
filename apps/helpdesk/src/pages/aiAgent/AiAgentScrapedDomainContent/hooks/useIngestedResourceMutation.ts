import { useCallback } from 'react'

import { reportError } from '@repo/logging'
import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    helpCenterKeys,
    useUpdateAllIngestedResourcesStatus,
    useUpdateIngestedResource,
} from 'models/helpCenter/queries'

import type { IngestedResourceStatus } from '../constant'

export const useIngestedResourceMutation = ({
    helpCenterId,
    ingestionLogId,
}: {
    helpCenterId: number
    ingestionLogId: number
}) => {
    const queryClient = useQueryClient()

    const {
        mutateAsync: updatedIngestedResourceMutateAsync,
        isLoading: isIngestedResourceUpdating,
    } = useUpdateIngestedResource({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: helpCenterKeys.ingestedResources(
                    helpCenterId,
                    ingestionLogId,
                ),
            })
        },
    })

    const {
        mutateAsync: updatedAllIngestedResourcesStatusMutateAsync,
        isLoading: isAllIngestedResourceUpdating,
    } = useUpdateAllIngestedResourcesStatus({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: helpCenterKeys.ingestedResources(
                    helpCenterId,
                    ingestionLogId,
                ),
            })
        },
    })

    const updateIngestedResource = useCallback(
        async (
            ingestedResourceId: number,
            updateFields: {
                status: IngestedResourceStatus
            },
        ) => {
            try {
                await updatedIngestedResourceMutateAsync([
                    undefined,
                    {
                        help_center_id: helpCenterId,
                        ingested_resource_id: ingestedResourceId,
                    },
                    updateFields,
                ])
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context: 'Error during ingested resource update',
                        updateFields,
                    },
                })
                throw error
            }
        },
        [updatedIngestedResourceMutateAsync, helpCenterId],
    )

    const updateAllIngestedResourcesStatus = useCallback(
        async (updateFields: { status: IngestedResourceStatus }) => {
            try {
                await updatedAllIngestedResourcesStatusMutateAsync([
                    undefined,
                    {
                        help_center_id: helpCenterId,
                        article_ingestion_log_id: ingestionLogId,
                    },
                    updateFields,
                ])
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context:
                            'Error during ingested resources status update',
                        updateFields,
                    },
                })
                throw error
            }
        },
        [
            updatedAllIngestedResourcesStatusMutateAsync,
            helpCenterId,
            ingestionLogId,
        ],
    )

    return {
        updateIngestedResource,
        isIngestedResourceUpdating,
        updateAllIngestedResourcesStatus,
        isAllIngestedResourceUpdating,
    }
}
