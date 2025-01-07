export enum AiAgentNotificationType {
    StartAiAgentSetup = 'start-ai-agent-setup',
    FinishAiAgentSetup = 'finish-ai-agent-setup',
    ActivateAiAgent = 'activate-ai-agent',
    MeetAiAgent = 'meet-ai-agent',
    FirstAiAgentTicket = 'first-ai-agent-ticket',
}

export type AiAgentNotificationPayload = {
    ai_agent_notification_type: AiAgentNotificationType
    shop_name: string
    shop_type: string
    ticket_id?: string
}
