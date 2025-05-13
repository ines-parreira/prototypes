import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    helpCenterKeys,
    useUpdateIngestedResource,
} from 'models/helpCenter/queries'
import { reportError } from 'utils/errors'

import { IngestedResourceStatus } from '../constant'

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

    const updateIngestedResource = useCallback(
        async (
            ingestedResourceId,
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

    return {
        updateIngestedResource,
        isIngestedResourceUpdating,
    }
}
