import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useProcessOpportunityForShopOpportunity,
} from '@gorgias/knowledge-service-queries'
import type {
    ProcessOpportunity,
    ProcessOpportunityOneOfFourDismissReason,
} from '@gorgias/knowledge-service-types'
import {
    ProcessOpportunityOneOfAction,
    ProcessOpportunityOneOfFourAction,
    ProcessOpportunityOneOfVisibilityStatus,
} from '@gorgias/knowledge-service-types'

export const useProcessOpportunity = (shopIntegrationId?: number) => {
    const queryClient = useQueryClient()

    return useProcessOpportunityForShopOpportunity({
        mutation: {
            onSuccess: async () => {
                if (!shopIntegrationId) return

                await queryClient.invalidateQueries({
                    queryKey:
                        queryKeys.opportunities.findOpportunitiesByShopOpportunity(
                            shopIntegrationId,
                        ),
                })
            },
        },
    })
}

export const buildApprovePayload = ({
    title,
    content,
    isVisible,
}: {
    title?: string
    content?: string
    isVisible: boolean
}): ProcessOpportunity => ({
    action: ProcessOpportunityOneOfAction.Approve,
    visibilityStatus: isVisible
        ? ProcessOpportunityOneOfVisibilityStatus.Public
        : ProcessOpportunityOneOfVisibilityStatus.Unlisted,
    title,
    content,
})

export const buildDismissPayload = (
    dismissReason?: ProcessOpportunityOneOfFourDismissReason,
): ProcessOpportunity => ({
    action: ProcessOpportunityOneOfFourAction.Dismiss,
    dismissReason,
})
