import type { OpportunityType } from './enums'

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
