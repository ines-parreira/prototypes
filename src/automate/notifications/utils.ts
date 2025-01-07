import {getAiAgentNavigationRoutes} from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {getLDClient} from 'utils/launchDarkly'

import {AiAgentNotificationPayload, AiAgentNotificationType} from './types'

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
        ai_agent_notification_type: aiAgentNotificationType,
        shop_name: shopName,
        ticket_id: ticketId,
    } = payload

    const flags = getLDClient().allFlags()
    const routes = getAiAgentNavigationRoutes(shopName, flags)

    switch (aiAgentNotificationType) {
        case AiAgentNotificationType.StartAiAgentSetup:
            return {
                title: 'Set up AI Agent',
                subtitle:
                    'We noticed you checking out AI Agent. It only takes a few steps to start automating 60% of your tickets!',
                redirectTo: routes.main,
            }
        case AiAgentNotificationType.FinishAiAgentSetup:
            return {
                title: 'Finish AI Agent setup',
                subtitle:
                    'You’re only a few steps away from getting AI Agent ready to start automating 60% of your tickets!',
                redirectTo: routes.onboardingWizard,
            }
        case AiAgentNotificationType.ActivateAiAgent:
            return {
                title: 'Activate AI Agent',
                subtitle:
                    'You’re just one click away from automating 60% of your tickets!',
                redirectTo: routes.main,
            }
        case AiAgentNotificationType.MeetAiAgent:
            return {
                title: 'Meet your newest team member: AI Agent',
                subtitle:
                    'Delight customers with instant and personalized answers, automating up to 60% of your tickets!',
                redirectTo: routes.main,
            }
        case AiAgentNotificationType.FirstAiAgentTicket:
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
