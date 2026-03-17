import { UserRole } from '@repo/utils'

import type { IconName } from '@gorgias/axiom'

export const WORKFLOWS_DEFAULT_PATH = '/app/workflows'

export enum WorkflowsSection {
    Tools = 'tools',
    FieldsAndTags = 'fields-and-tags',
}

export type WorkflowsSectionConfig = {
    id: WorkflowsSection
    label: string
    icon?: IconName
    requiredRole?: UserRole.Admin | UserRole.Agent
}

export const workflowsSections: Record<
    WorkflowsSection,
    WorkflowsSectionConfig
> = {
    [WorkflowsSection.Tools]: {
        id: WorkflowsSection.Tools,
        label: 'Tools',
        icon: 'wrench',
    },
    [WorkflowsSection.FieldsAndTags]: {
        id: WorkflowsSection.FieldsAndTags,
        label: 'Fields and Tags',
        icon: 'tag',
        requiredRole: UserRole.Agent,
    },
}

export enum WorkflowsRoute {
    Flows = 'Flows',
    OrderManagement = 'OrderManagement',
    Rules = 'Rules',
    Macros = 'Macros',
    TicketAssignment = 'TicketAssignment',
    AutoMerge = 'AutoMerge',
    CSAT = 'CSAT',
    SLA = 'SLA',
    ArticleRecommendations = 'ArticleRecommendations',
    TicketFields = 'TicketFields',
    CustomerFields = 'CustomerFields',
    FieldConditions = 'FieldConditions',
    Tags = 'Tags',
}

export type WorkflowsRouteConfig = {
    path: string
    label: string
    requiredRole?: UserRole.Admin | UserRole.Agent
}

export const workflowsRoutes: Record<WorkflowsRoute, WorkflowsRouteConfig> = {
    [WorkflowsRoute.Flows]: {
        path: 'flows',
        label: 'Flows',
        requiredRole: UserRole.Agent,
    },
    [WorkflowsRoute.OrderManagement]: {
        path: 'order-management',
        label: 'Order Management',
        requiredRole: UserRole.Agent,
    },
    [WorkflowsRoute.Rules]: {
        path: 'rules',
        label: 'Rules',
        requiredRole: UserRole.Agent,
    },
    [WorkflowsRoute.Macros]: {
        path: 'macros',
        label: 'Macros',
    },
    [WorkflowsRoute.TicketAssignment]: {
        path: 'ticket-assignment',
        label: 'Ticket Assignment',
        requiredRole: UserRole.Admin,
    },
    [WorkflowsRoute.AutoMerge]: {
        path: 'auto-merge',
        label: 'Auto-merge',
        requiredRole: UserRole.Admin,
    },
    [WorkflowsRoute.CSAT]: {
        path: 'satisfaction-surveys',
        label: 'CSAT',
        requiredRole: UserRole.Admin,
    },
    [WorkflowsRoute.SLA]: {
        path: 'sla',
        label: 'SLAs',
        requiredRole: UserRole.Agent,
    },
    [WorkflowsRoute.ArticleRecommendations]: {
        path: 'article-recommendations',
        label: 'Article Recommendations',
        requiredRole: UserRole.Agent,
    },
    [WorkflowsRoute.TicketFields]: {
        path: 'ticket-fields',
        label: 'Ticket Fields',
        requiredRole: UserRole.Admin,
    },
    [WorkflowsRoute.CustomerFields]: {
        path: 'customer-fields',
        label: 'Customer Fields',
        requiredRole: UserRole.Admin,
    },
    [WorkflowsRoute.FieldConditions]: {
        path: 'ticket-field-conditions',
        label: 'Field Conditions',
        requiredRole: UserRole.Admin,
    },
    [WorkflowsRoute.Tags]: {
        path: 'manage-tags',
        label: 'Tags',
        requiredRole: UserRole.Agent,
    },
}
