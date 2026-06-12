import { normalizeHtml } from '@repo/utils'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
    queryKeys,
    useProcessOpportunityForShopOpportunity,
} from '@gorgias/knowledge-service-queries'
import type {
    ProcessOpportunity,
    ProcessOpportunityOneOfFiveResolutionsItemOneOf,
    ProcessOpportunityOneOfFiveResolutionsItemOneOfOnezero,
    ProcessOpportunityOneOfFiveResolutionsItemOneOfSix,
    ProcessOpportunityOneOfThreeDismissReason,
} from '@gorgias/knowledge-service-types'
import { ProcessOpportunityOneOfVisibilityStatus } from '@gorgias/knowledge-service-types'
import { get } from '@gorgias/toolkit'

import type { Opportunity, ResourceFormFields } from '../types'
import { ResourceType } from '../types'

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
            onError: async (error) => {
                if (
                    isAxiosError(error) &&
                    get(error, 'response.status') === 409 &&
                    shopIntegrationId
                ) {
                    await queryClient.invalidateQueries({
                        queryKey:
                            queryKeys.opportunities.findOpportunitiesByShopOpportunity(
                                shopIntegrationId,
                            ),
                    })
                }
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
    action: 'APPROVE',
    visibilityStatus: isVisible
        ? ProcessOpportunityOneOfVisibilityStatus.Public
        : ProcessOpportunityOneOfVisibilityStatus.Unlisted,
    title,
    content,
})

export const buildDismissPayload = (
    dismissReason?: ProcessOpportunityOneOfThreeDismissReason,
): ProcessOpportunity => ({
    action: 'DISMISS',
    dismissReason,
})

export const buildResolveConflictPayload = ({
    selectedOpportunity,
    resourceUpdates,
}: {
    selectedOpportunity: Opportunity
    resourceUpdates: ResourceFormFields[]
}): ProcessOpportunity | null => {
    const resolutions = selectedOpportunity.resources
        .map(
            (
                resource,
                index,
            ):
                | ProcessOpportunityOneOfFiveResolutionsItemOneOf
                | ProcessOpportunityOneOfFiveResolutionsItemOneOfSix
                | ProcessOpportunityOneOfFiveResolutionsItemOneOfOnezero
                | null => {
                const update = resourceUpdates[index]

                if (!update || !resource.identifiers) return null

                if (update.isDeleted) {
                    return {
                        action: 'DELETE',
                        resourceIdentifier: resource.identifiers,
                    }
                }

                if (
                    !update.isVisible &&
                    resource.type === ResourceType.EXTERNAL_SNIPPET
                ) {
                    return {
                        action: 'DISABLE',
                        resourceIdentifier: resource.identifiers,
                    }
                }

                const titleChanged = update.title !== resource.title
                const contentChanged =
                    normalizeHtml(update.content) !==
                    normalizeHtml(resource.content)
                const visibilityChanged =
                    update.isVisible !== resource.isVisible

                if (titleChanged || contentChanged || visibilityChanged) {
                    return {
                        action: 'EDIT',
                        title: update.title,
                        content: update.content,
                        visibilityStatus: update.isVisible
                            ? ProcessOpportunityOneOfVisibilityStatus.Public
                            : ProcessOpportunityOneOfVisibilityStatus.Unlisted,
                        resourceIdentifier: resource.identifiers,
                    }
                }

                return null
            },
        )
        .filter(
            (
                resolution,
            ): resolution is
                | ProcessOpportunityOneOfFiveResolutionsItemOneOf
                | ProcessOpportunityOneOfFiveResolutionsItemOneOfSix
                | ProcessOpportunityOneOfFiveResolutionsItemOneOfOnezero =>
                resolution !== null,
        )

    if (resolutions.length === 0) {
        return null
    }

    return {
        action: 'RESOLVE_CONFLICT',
        resolutions,
    }
}
