import type { ArticleTemplateReviewAction } from 'models/helpCenter/types'

import type { OpportunityType } from './enums'

export interface OpportunityConfig {
    shopName: string
    shopIntegrationId: number | undefined
    helpCenterId: number
    guidanceHelpCenterId: number
    useKnowledgeService: boolean
    onArchive: (articleKey: string) => void
    onPublish: (articleKey: string) => void
    markArticleAsReviewed: (
        templateKey: string,
        reviewAction: ArticleTemplateReviewAction,
    ) => void
    onOpportunityAccepted?: (context: {
        opportunityId: string
        opportunityType: string
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
}

export interface OpportunityListItem extends OpportunityBase {
    insight: string
}

export interface Opportunity extends OpportunityBase {
    title: string
    content: string
    detectionObjectIds?: string[]
}

export type SidebarOpportunityItem = OpportunityListItem | Opportunity

export const isOpportunityListItem = (
    item: SidebarOpportunityItem,
): item is OpportunityListItem => {
    return 'insight' in item
}

export const isOpportunity = (
    item: SidebarOpportunityItem,
): item is Opportunity => {
    return 'title' in item
}

export const getOpportunitySidebarDisplayText = (
    item: SidebarOpportunityItem,
): string => {
    if (isOpportunityListItem(item)) {
        return item.insight
    }
    return item.title
}
