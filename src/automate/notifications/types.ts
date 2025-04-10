export enum AiAgentNotificationType {
    StartAiAgentSetup = 'start-ai-agent-setup',
    FinishAiAgentSetup = 'finish-ai-agent-setup',
    ActivateAiAgent = 'activate-ai-agent',
    MeetAiAgent = 'meet-ai-agent',
    FirstAiAgentTicket = 'first-ai-agent-ticket',
    DomainScrapingFinished = 'domain-scraping-finished',
}

export type AiAgentNotificationPayload = {
    ai_agent_notification_type: AiAgentNotificationType
    shop_name: string
    shop_type: string
    ticket_id?: string
}

export type WorkflowConfigurationUpdatedNotificationPayload = {
    store_name: string
    store_type: string
    type: 'trackstar-disconnected'
    integration_name: string
}
