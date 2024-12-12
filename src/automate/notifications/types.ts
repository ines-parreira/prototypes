export enum AiAgentNotificationSeries {
    StartAiAgentSetup = 'start-ai-agent-setup',
    FinishAiAgentSetup = 'finish-ai-agent-setup',
    ActivateAiAgent = 'activate-ai-agent',
    MeetAiAgent = 'meet-ai-agent',
    FirstAiAgentTicket = 'first-ai-agent-ticket',
}

export type AiAgentNotificationPayload = {
    notification_series: AiAgentNotificationSeries
    shop_name: string
    shop_type: string
    ticket_id?: string
}
