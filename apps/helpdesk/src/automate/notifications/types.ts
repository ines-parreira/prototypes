export enum AiAgentNotificationType {
    StartAiAgentSetup = 'start-ai-agent-setup',
    FinishAiAgentSetup = 'finish-ai-agent-setup',
    ActivateAiAgent = 'activate-ai-agent',
    MeetAiAgent = 'meet-ai-agent',
    FirstAiAgentTicket = 'first-ai-agent-ticket',
    ScrapingProcessingFinished = 'scraping-processing-finished',
    AiShoppingAssistantTrialRequest = 'ai-shopping-assistant-trial-request',
    AiAgentTrialRequest = 'ai-agent-trial-request',
    NewOpportunityGenerated = 'new-opportunity-generated',
}

export type AiAgentNotificationPayload = {
    ai_agent_notification_type: AiAgentNotificationType
    shop_name: string
    shop_type: string
    ticket_id?: string
    agent_id?: number
    opportunity_ids?: number[]
    total_tickets?: number
}

export type WorkflowConfigurationUpdatedNotificationPayload = {
    store_name: string
    store_type: string
    type: 'trackstar-disconnected'
    integration_name: string
}
