import { useMemo } from 'react'

import type { UserRole } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import {
    WorkflowsRoute,
    workflowsRoutes,
    WorkflowsSection,
    workflowsSections,
} from 'routes/layout/products/workflows'

export type WorkflowsNavbarSection = {
    id: string
    label: string
    icon?: IconName
    requiredRole?: UserRole.Admin | UserRole.Agent
    items: {
        id: string
        path: string
        label: string
        requiredRole?: UserRole.Admin | UserRole.Agent
        shouldRender?: boolean
    }[]
}

export function useWorkflowsNavigation() {
    const { hasAccess: hasAIAgentAccess, isLoading } = useAiAgentAccess()
    const integrations = useStoreIntegrations()

    const shouldRenderAiAgentRelatedItems = useMemo(
        () => hasAIAgentAccess && integrations.length > 0 && !isLoading,
        [hasAIAgentAccess, integrations, isLoading],
    )

    const { enabledInSettings: isArticleRecEnabledWhileSunset } =
        useIsArticleRecommendationsEnabledWhileSunset()

    const sections = useMemo<WorkflowsNavbarSection[]>(() => {
        const toolsItems = [
            {
                id: WorkflowsRoute.Flows,
                path: workflowsRoutes[WorkflowsRoute.Flows].path,
                label: workflowsRoutes[WorkflowsRoute.Flows].label,
                requiredRole:
                    workflowsRoutes[WorkflowsRoute.Flows].requiredRole,
                shouldRender: shouldRenderAiAgentRelatedItems,
            },
            {
                id: WorkflowsRoute.OrderManagement,
                path: workflowsRoutes[WorkflowsRoute.OrderManagement].path,
                label: workflowsRoutes[WorkflowsRoute.OrderManagement].label,
                requiredRole:
                    workflowsRoutes[WorkflowsRoute.OrderManagement]
                        .requiredRole,
                shouldRender: shouldRenderAiAgentRelatedItems,
            },
            {
                id: WorkflowsRoute.Rules,
                path: workflowsRoutes[WorkflowsRoute.Rules].path,
                label: workflowsRoutes[WorkflowsRoute.Rules].label,
                requiredRole:
                    workflowsRoutes[WorkflowsRoute.Rules].requiredRole,
            },
            {
                id: WorkflowsRoute.Macros,
                path: workflowsRoutes[WorkflowsRoute.Macros].path,
                label: workflowsRoutes[WorkflowsRoute.Macros].label,
                requiredRole:
                    workflowsRoutes[WorkflowsRoute.Macros].requiredRole,
            },
            {
                id: WorkflowsRoute.TicketAssignment,
                path: workflowsRoutes[WorkflowsRoute.TicketAssignment].path,
                label: workflowsRoutes[WorkflowsRoute.TicketAssignment].label,
                requiredRole:
                    workflowsRoutes[WorkflowsRoute.TicketAssignment]
                        .requiredRole,
            },
            {
                id: WorkflowsRoute.AutoMerge,
                path: workflowsRoutes[WorkflowsRoute.AutoMerge].path,
                label: workflowsRoutes[WorkflowsRoute.AutoMerge].label,
                requiredRole:
                    workflowsRoutes[WorkflowsRoute.AutoMerge].requiredRole,
            },
            {
                id: WorkflowsRoute.CSAT,
                path: workflowsRoutes[WorkflowsRoute.CSAT].path,
                label: workflowsRoutes[WorkflowsRoute.CSAT].label,
                requiredRole: workflowsRoutes[WorkflowsRoute.CSAT].requiredRole,
            },
            {
                id: WorkflowsRoute.SLA,
                path: workflowsRoutes[WorkflowsRoute.SLA].path,
                label: workflowsRoutes[WorkflowsRoute.SLA].label,
                requiredRole: workflowsRoutes[WorkflowsRoute.SLA].requiredRole,
            },
        ]

        if (isArticleRecEnabledWhileSunset) {
            toolsItems.push({
                id: WorkflowsRoute.ArticleRecommendations,
                path: workflowsRoutes[WorkflowsRoute.ArticleRecommendations]
                    .path,
                label: workflowsRoutes[WorkflowsRoute.ArticleRecommendations]
                    .label,
                requiredRole:
                    workflowsRoutes[WorkflowsRoute.ArticleRecommendations]
                        .requiredRole,
                shouldRender: shouldRenderAiAgentRelatedItems,
            })
        }

        return [
            {
                id: workflowsSections[WorkflowsSection.Tools].id,
                label: workflowsSections[WorkflowsSection.Tools].label,
                icon: workflowsSections[WorkflowsSection.Tools].icon,
                items: toolsItems,
            },
            {
                id: workflowsSections[WorkflowsSection.FieldsAndTags].id,
                label: workflowsSections[WorkflowsSection.FieldsAndTags].label,
                icon: workflowsSections[WorkflowsSection.FieldsAndTags].icon,
                requiredRole:
                    workflowsSections[WorkflowsSection.FieldsAndTags]
                        .requiredRole,
                items: [
                    {
                        id: WorkflowsRoute.TicketFields,
                        path: workflowsRoutes[WorkflowsRoute.TicketFields].path,
                        label: workflowsRoutes[WorkflowsRoute.TicketFields]
                            .label,
                        requiredRole:
                            workflowsRoutes[WorkflowsRoute.TicketFields]
                                .requiredRole,
                    },
                    {
                        id: WorkflowsRoute.CustomerFields,
                        path: workflowsRoutes[WorkflowsRoute.CustomerFields]
                            .path,
                        label: workflowsRoutes[WorkflowsRoute.CustomerFields]
                            .label,
                        requiredRole:
                            workflowsRoutes[WorkflowsRoute.CustomerFields]
                                .requiredRole,
                    },
                    {
                        id: WorkflowsRoute.FieldConditions,
                        path: workflowsRoutes[WorkflowsRoute.FieldConditions]
                            .path,
                        label: workflowsRoutes[WorkflowsRoute.FieldConditions]
                            .label,
                        requiredRole:
                            workflowsRoutes[WorkflowsRoute.FieldConditions]
                                .requiredRole,
                    },
                    {
                        id: WorkflowsRoute.Tags,
                        path: workflowsRoutes[WorkflowsRoute.Tags].path,
                        label: workflowsRoutes[WorkflowsRoute.Tags].label,
                        requiredRole:
                            workflowsRoutes[WorkflowsRoute.Tags].requiredRole,
                    },
                ],
            },
        ]
    }, [shouldRenderAiAgentRelatedItems, isArticleRecEnabledWhileSunset])

    return { sections }
}
