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
    DomainSyncCompleted = 'domain-sync-completed',
    DomainSyncFailed = 'domain-sync-failed',
    UrlSyncCompleted = 'url-sync-completed',
    UrlSyncFailed = 'url-sync-failed',
}

type AiAgentNotificationPayloadBase = {
    shop_name: string
    shop_type: string
}

type OnboardingNotificationPayload = AiAgentNotificationPayloadBase & {
    ai_agent_notification_type:
        | AiAgentNotificationType.StartAiAgentSetup
        | AiAgentNotificationType.FinishAiAgentSetup
        | AiAgentNotificationType.ActivateAiAgent
        | AiAgentNotificationType.MeetAiAgent
        | AiAgentNotificationType.ScrapingProcessingFinished
}

type FirstAiAgentTicketNotificationPayload = AiAgentNotificationPayloadBase & {
    ai_agent_notification_type: AiAgentNotificationType.FirstAiAgentTicket
    ticket_id?: string
}

type TrialRequestNotificationPayload = AiAgentNotificationPayloadBase & {
    ai_agent_notification_type:
        | AiAgentNotificationType.AiShoppingAssistantTrialRequest
        | AiAgentNotificationType.AiAgentTrialRequest
    agent_id: number
}

type NewOpportunityNotificationPayload = AiAgentNotificationPayloadBase & {
    ai_agent_notification_type: AiAgentNotificationType.NewOpportunityGenerated
    opportunity_ids: readonly number[]
    total_tickets: number
}

type SyncNotificationPayload = AiAgentNotificationPayloadBase & {
    ai_agent_notification_type:
        | AiAgentNotificationType.DomainSyncCompleted
        | AiAgentNotificationType.DomainSyncFailed
        | AiAgentNotificationType.UrlSyncCompleted
        | AiAgentNotificationType.UrlSyncFailed
    source_url: string
    source_type: 'domain' | 'url'
}

export type AiAgentNotificationPayload =
    | OnboardingNotificationPayload
    | FirstAiAgentTicketNotificationPayload
    | TrialRequestNotificationPayload
    | NewOpportunityNotificationPayload
    | SyncNotificationPayload

export type WorkflowConfigurationUpdatedNotificationPayload = {
    store_name: string
    store_type: string
    type: 'trackstar-disconnected'
    integration_name: string
}
