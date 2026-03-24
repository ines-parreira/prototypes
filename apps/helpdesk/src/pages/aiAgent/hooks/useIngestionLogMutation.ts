import { reportError } from '@repo/logging'
import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { helpCenterKeys, useStartIngestion } from 'models/helpCenter/queries'

import type { IngestionType } from '../AiAgentScrapedDomainContent/constant'

export const useIngestionLogMutation = ({
    helpCenterId,
    queryKey,
}: {
    helpCenterId: number
    queryKey?: any[]
}) => {
    const queryClient = useQueryClient()

    const { mutateAsync: startIngestionAsync } = useStartIngestion({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey:
                    queryKey ?? helpCenterKeys.ingestionLogs(helpCenterId),
            })
        },
    })

    const startIngestion = async (input: {
        url: string
        type: IngestionType
    }) => {
        try {
            await startIngestionAsync([
                undefined,
                { help_center_id: helpCenterId },
                input,
            ])
        } catch (error) {
            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context: 'Error during ingestion start',
                    input,
                },
            })
            throw error
        }
    }

    return { startIngestion }
}
