import { Opportunity } from '../utils/mapAiArticlesToOpportunities'

export const useOpportunitiesNavigation = ({
    selectedOpportunity,
    opportunities,
}: {
    selectedOpportunity: Opportunity | null
    opportunities: Opportunity[]
}) => {
    if (!selectedOpportunity || !opportunities || opportunities.length === 0) {
        return {
            isFirst: true,
            isLast: true,
            position: 0,
        }
    }
    const position = opportunities.findIndex(
        (o) => o.id === selectedOpportunity.id,
    )
    return {
        isFirst: position === 0,
        isLast: position === opportunities.length - 1,
        position: position,
    }
}
