import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useProcessOpportunityForShopOpportunity,
} from '@gorgias/knowledge-service-queries'
import type {
    ProcessOpportunity,
    ProcessOpportunityOneOfFourDismissReason,
    ProcessOpportunityOneOfSevenResolutionsItemOneOf,
    ProcessOpportunityOneOfSevenResolutionsItemOneOfOnetwo,
    ProcessOpportunityOneOfSevenResolutionsItemOneOfSeven,
} from '@gorgias/knowledge-service-types'
import {
    ProcessOpportunityOneOfAction,
    ProcessOpportunityOneOfFourAction,
    ProcessOpportunityOneOfSevenAction,
    ProcessOpportunityOneOfSevenResolutionsItemOneOfAction,
    ProcessOpportunityOneOfSevenResolutionsItemOneOfOnetwoAction,
    ProcessOpportunityOneOfSevenResolutionsItemOneOfSevenAction,
    ProcessOpportunityOneOfVisibilityStatus,
} from '@gorgias/knowledge-service-types'

import { normalizeHtml } from 'utils/html'

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
                | ProcessOpportunityOneOfSevenResolutionsItemOneOf
                | ProcessOpportunityOneOfSevenResolutionsItemOneOfSeven
                | ProcessOpportunityOneOfSevenResolutionsItemOneOfOnetwo
                | null => {
                const update = resourceUpdates[index]

                if (!update || !resource.identifiers) return null

                if (update.isDeleted) {
                    return {
                        action: ProcessOpportunityOneOfSevenResolutionsItemOneOfSevenAction.Delete,
                        resourceIdentifier: resource.identifiers,
                    }
                }

                if (
                    !update.isVisible &&
                    resource.type === ResourceType.EXTERNAL_SNIPPET
                ) {
                    return {
                        action: ProcessOpportunityOneOfSevenResolutionsItemOneOfOnetwoAction.Disable,
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
                        action: ProcessOpportunityOneOfSevenResolutionsItemOneOfAction.Edit,
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
                | ProcessOpportunityOneOfSevenResolutionsItemOneOf
                | ProcessOpportunityOneOfSevenResolutionsItemOneOfSeven
                | ProcessOpportunityOneOfSevenResolutionsItemOneOfOnetwo =>
                resolution !== null,
        )

    if (resolutions.length === 0) {
        return null
    }

    return {
        action: ProcessOpportunityOneOfSevenAction.ResolveConflict,
        resolutions,
    }
}
