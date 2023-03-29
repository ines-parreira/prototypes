export type ChatApplicationAutomationSettings = {
    id: number
    applicationId: number
    articleRecommendation: {enabled: boolean}
    orderManagement: {enabled: boolean}
    quickResponses: {enabled: boolean}
    workflows: {enabled: boolean}
    createdDatetime: string
    updatedDatetime: string
}
