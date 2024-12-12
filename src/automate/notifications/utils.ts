import {AiAgentNotificationPayload, AiAgentNotificationSeries} from './types'

type NotificationParams = {
    title: string
    subtitle: string
    redirectTo: string
}

export const getNotificationParams = (
    payload: AiAgentNotificationPayload,
    aiAgentTicketViewId: number | null
): NotificationParams | null => {
    const {
        notification_series: notificationSeries,
        shop_name: shopName,
        shop_type: shopType,
        ticket_id: ticketId,
    } = payload

    switch (notificationSeries) {
        case AiAgentNotificationSeries.StartAiAgentSetup:
            return {
                title: 'Set up AI Agent',
                subtitle:
                    'We noticed you checking out AI Agent. It only takes a few steps to start automating 60% of your tickets!',
                redirectTo: `/app/automation/${shopType}/${shopName}/ai-agent`,
            }
        case AiAgentNotificationSeries.FinishAiAgentSetup:
            return {
                title: 'Finish AI Agent setup',
                subtitle:
                    'You’re only a few steps away from getting AI Agent ready to start automating 60% of your tickets!',
                redirectTo: `/app/automation/${shopType}/${shopName}/ai-agent/new`,
            }
        case AiAgentNotificationSeries.ActivateAiAgent:
            return {
                title: 'Activate AI Agent',
                subtitle:
                    'You’re just one click away from automating 60% of your tickets!',
                redirectTo: `/app/automation/${shopType}/${shopName}/ai-agent`,
            }
        case AiAgentNotificationSeries.MeetAiAgent:
            return {
                title: 'Meet your newest team member: AI Agent',
                subtitle:
                    'Delight customers with instant and personalized answers, automating up to 60% of your tickets!',
                redirectTo: `/app/automation/${shopType}/${shopName}/ai-agent`,
            }
        case AiAgentNotificationSeries.FirstAiAgentTicket:
            return {
                title: 'AI Agent answered it’s first ticket',
                subtitle:
                    'Review AI Agent’s response and leave feedback in the ticket to improve it’s performance.',
                redirectTo:
                    aiAgentTicketViewId && ticketId
                        ? `/app/views/${aiAgentTicketViewId}/${ticketId}`
                        : '',
            }
        default:
            return null
    }
}
