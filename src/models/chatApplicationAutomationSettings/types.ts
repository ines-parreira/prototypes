export type ChatApplicationAutomationSettings = {
    id: number
    applicationId: number
    articleRecommendation: {enabled: boolean}
    orderManagement: {enabled: boolean}
    quickResponses: {enabled: boolean}
    workflows: {
        enabled: boolean
        entrypoints?: {workflow_id: string; enabled: boolean}[]
    }
    createdDatetime: string
    updatedDatetime: string
}
