export const AutomationFeatureType = {
    AiAgent: 'ai-agent', // sub types AutomationSkillType
    Flows: 'flow',
    OrderManagement: 'order-management', // Equivalent to Cancel order
    ArticleRecommendation: 'article-recommendation',
} as const

export const AutomationSkillType = {
    AiAgentSales: 'ai-agent-sales',
    AiAgentSupport: 'ai-agent-support',
}

export type AutomationFeatureType =
    (typeof AutomationFeatureType)[keyof typeof AutomationFeatureType]
