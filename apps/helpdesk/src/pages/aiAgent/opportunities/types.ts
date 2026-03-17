import type { Components } from 'rest_api/help_center_api/client.generated'

import type { OpportunityType } from './enums'

type ArticleIngestionLog = Components.Schemas.ArticleIngestionLogDto

export enum ResourceType {
    GUIDANCE = 'guidance',
    ARTICLE = 'article',
    EXTERNAL_SNIPPET = 'external_snippet',
}

export enum OpportunityPageReferrer {
    IN_APP_NOTIFICATION = 'in-app-notification',
    OVERVIEW_PAGE = 'overview-page',
    IN_TICKET_FEEDBACK_TAB = 'in-ticket-feedback-tab',
}

export interface ResourceIdentifiers {
    resourceId: string
    resourceSetId: string
    resourceLocale: string | null
    resourceVersion: string | null
}

export interface OpportunityResource {
    title: string
    content: string
    type: ResourceType
    isVisible: boolean
    insight?: string
    identifiers?: ResourceIdentifiers
    meta?: {
        articleIngestionLog?: Partial<ArticleIngestionLog> &
            Pick<ArticleIngestionLog, 'source' | 'source_name'>
        executionId?: string
    }
}

export interface ResourceFormFields {
    title: string
    content: string
    isVisible: boolean
    isDeleted?: boolean
}

export interface OpportunityOperation {
    action: string
    resourceId: string
    resourceSetId: string
    resourceLocale: string | null
    resourceVersion: string | null
}

export interface OpportunityConfig {
    shopName: string
    shopIntegrationId: number | undefined
    helpCenterId: number
    guidanceHelpCenterId: number
    useKnowledgeService: boolean
    onArchive: (articleKey: string) => void
    onPublish: (articleKey: string) => void
    onOpportunityAccepted?: (context: {
        opportunityId: string
        opportunityType: string
        operations?: OpportunityOperation[]
    }) => void
    onOpportunityDismissed?: (context: {
        opportunityId: string
        opportunityType: string
    }) => void
}

interface OpportunityBase {
    id: string
    key: string
    type: OpportunityType
    ticketCount?: number
    insight: string
}

export interface OpportunityListItem extends OpportunityBase {
    insight: string
}

export interface Opportunity extends OpportunityBase {
    detectionObjectIds?: string[]
    resources: OpportunityResource[]
    isRelevant?: boolean
}

export type SidebarOpportunityItem = OpportunityListItem | Opportunity

export const isOpportunity = (
    item: SidebarOpportunityItem,
): item is Opportunity => {
    return 'resources' in item
}
