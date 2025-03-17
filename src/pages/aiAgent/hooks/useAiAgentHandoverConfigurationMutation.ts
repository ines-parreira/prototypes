import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    handoverConfigurationKeys,
    useUpsertStoreHandoverConfiguration,
} from 'models/aiAgent/queries'
import { HandoverConfigurationData } from 'models/aiAgent/types'

type Params = {
    accountDomain: string
    storeName: string
    integrationId: number
}
export const useAiAgentHandoverConfigurationMutation = ({
    accountDomain,
    storeName,
    integrationId,
}: Params) => {
    const queryClient = useQueryClient()

    const {
        mutateAsync: upsertHandoverConfigurationAsync,
        isLoading: isUpsertLoading,
        error: isUpsertError,
    } = useUpsertStoreHandoverConfiguration({
        onSuccess: ({ channel }: HandoverConfigurationData) => {
            void queryClient.invalidateQueries({
                queryKey: handoverConfigurationKeys.detail({
                    accountDomain,
                    storeName,
                    channel,
                }),
            })
        },
    })

    const upsertHandoverConfiguration = useCallback(
        async (handoverConfiguration: HandoverConfigurationData) =>
            await upsertHandoverConfigurationAsync([
                accountDomain,
                storeName,
                integrationId,
                handoverConfiguration,
            ]),
        [
            accountDomain,
            storeName,
            integrationId,
            upsertHandoverConfigurationAsync,
        ],
    )

    return {
        upsertHandoverConfiguration,
        isUpsertLoading,
        isUpsertError,
    }
}
