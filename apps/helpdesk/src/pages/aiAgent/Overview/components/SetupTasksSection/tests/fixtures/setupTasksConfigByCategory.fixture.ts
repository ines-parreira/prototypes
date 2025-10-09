import {
    CreateAnActionBody,
    EnableAIAgentOnChatBody,
    EnableTriggerOnSearchBody,
    MonitorAiAgentBody,
    UpdateShopifyPermissionsBody,
    VerifyEmailDomainBody,
} from 'pages/aiAgent/Overview/components/SetupTasksSection/SetupTaskBodies'

export const mockSetupTasksConfigByCategory = {
    tasksConfigByCategory: {
        Essential: [
            {
                stepName: 'MONITOR' as any,
                displayName: 'Verify your email domain',
                isCompleted: true,
                body: VerifyEmailDomainBody,
            },
            {
                stepName: 'UPDATE_SHOPIFY_PERMISSIONS' as any,
                displayName: 'Update Shopify permissions',
                isCompleted: true,
                body: UpdateShopifyPermissionsBody,
            },
        ],
        Customize: [
            {
                stepName: 'ENABLE_TRIGGER_ON_SEARCH' as any,
                displayName: `Enable 'Trigger on Search'`,
                isCompleted: false,
                body: EnableTriggerOnSearchBody,
            },
        ],
        Train: [
            {
                stepName: 'CREATE_AN_ACTION' as any,
                displayName: 'Create an Action',
                isCompleted: false,
                body: CreateAnActionBody,
            },
            {
                stepName: 'REVIEW_AI_AGENT_INTERACTIONS' as any,
                displayName: 'Monitor AI Agent interactions',
                isCompleted: false,
                body: MonitorAiAgentBody,
            },
        ],
        Deploy: [
            {
                stepName: 'ENABLE_AI_AGENT_ON_CHAT' as any,
                displayName: 'Enable AI Agent on chat',
                isCompleted: false,
                body: EnableAIAgentOnChatBody,
            },
        ],
    },
    completionPercentage: 33,
    isLoading: false,
    postGoLiveStepId: 'mock-post-go-live-id',
    error: null,
}
