export const AutomationFeatureType = {
    AiAgent: 'ai-agent',
    AiAgentSales: 'ai-agent-sales',
    AiAgentSupport: 'ai-agent-support',
    Flows: 'flow',
    OrderManagement: 'order-management',
    ArticleRecommendation: 'article-recommendation',
} as const

export type AutomationFeatureType =
    (typeof AutomationFeatureType)[keyof typeof AutomationFeatureType]
