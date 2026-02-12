import moment from 'moment'

import type { User } from 'config/types/user'
import type {
    OnboardingNotificationState,
    TrialRequestNotification,
} from 'models/aiAgent/types'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getAgent } from 'services/notificationTracker/notificationTracker'

import type { AiAgentNotificationPayload } from './types'
import { AiAgentNotificationType } from './types'

type NotificationParams = {
    title: string
    subtitle: string
    redirectTo: string
    excerpt?: string
}

export const getNotificationParams = (
    payload: AiAgentNotificationPayload,
    aiAgentTicketViewId: number | null,
): NotificationParams | null => {
    const {
        ai_agent_notification_type: aiAgentNotificationType,
        shop_name: shopName,
        ticket_id: ticketId,
        agent_id: agentId,
        opportunity_ids: opportunityIds,
        total_tickets: totalTickets,
    } = payload

    const routes = getAiAgentNavigationRoutes(shopName)
    let agent: User | undefined

    if (agentId) {
        agent = getAgent(agentId)
    }

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
                redirectTo: routes.settings,
            }
        case AiAgentNotificationType.MeetAiAgent:
            return {
                title: 'Meet your new team member: AI Agent',
                subtitle:
                    'Delight customers with instant and personalized answers, automating up to 60% of your tickets!',
                redirectTo: routes.main,
            }
        case AiAgentNotificationType.ScrapingProcessingFinished:
            return {
                title: 'Your AI Agent knowledge is ready!',
                subtitle: `We’ve finished syncing your store ${shopName} so AI Agent can use it to answer tickets.`,
                redirectTo: routes.knowledge,
            }
        case AiAgentNotificationType.FirstAiAgentTicket:
            return {
                title: 'AI Agent answered its first ticket',
                subtitle:
                    'Review AI Agent’s response and leave feedback in the ticket to improve its performance.',
                redirectTo:
                    aiAgentTicketViewId && ticketId
                        ? `/app/views/${aiAgentTicketViewId}/${ticketId}`
                        : '',
            }
        case AiAgentNotificationType.AiShoppingAssistantTrialRequest:
            const agentName = agent?.name || 'Your team'
            return {
                title: 'New message',
                subtitle: `<b>Trial request</b> from <b>${agentName}</b>`,
                excerpt: `${agentName} has expressed interest in trying out the Shopping Assistant for 14 days at no additional cost.`,
                redirectTo: `/app/ai-agent/shopify/${shopName}/sales?from=notification`,
            }
        case AiAgentNotificationType.AiAgentTrialRequest:
            const aiAgentName = agent?.name || 'Your team'
            return {
                title: 'New message',
                subtitle: `<b>Trial request</b> from <b>${aiAgentName}</b>`,
                excerpt: `${aiAgentName} wants to try out AI Agent for 14 days for ${shopName} for free.`,
                redirectTo: `/app/ai-agent/shopify/${shopName}/trial?from=notification`,
            }
        case AiAgentNotificationType.NewOpportunityGenerated:
            if (!opportunityIds || !opportunityIds.length) return null
            const totalOpportunities = opportunityIds.length
            return {
                title: 'New opportunities to improve AI Agent',
                subtitle: `We found ${totalOpportunities} opportunities affecting ${totalTickets} tickets. Review and apply high-impact fixes to improve responses.`,
                redirectTo: routes.opportunitiesWithId(
                    opportunityIds[0].toString(),
                ),
            }
        default:
            return null
    }
}

export const getNotificationReceivedDatetimePayload = (
    payload: AiAgentNotificationPayload,
    onboardingNotificationState?: OnboardingNotificationState,
): Partial<OnboardingNotificationState> => {
    const {
        ai_agent_notification_type: aiAgentNotificationType,
        agent_id: agentId,
    } = payload

    const receivedDatetime = new Date().toISOString()
    switch (aiAgentNotificationType) {
        case AiAgentNotificationType.StartAiAgentSetup:
            return {
                startAiAgentSetupNotificationReceivedDatetime: receivedDatetime,
            }
        case AiAgentNotificationType.FinishAiAgentSetup:
            return {
                finishAiAgentSetupNotificationReceivedDatetime:
                    receivedDatetime,
            }
        case AiAgentNotificationType.ActivateAiAgent:
            return {
                activateAiAgentNotificationReceivedDatetime: receivedDatetime,
            }
        case AiAgentNotificationType.MeetAiAgent:
            return {
                meetAiAgentNotificationReceivedDatetime: receivedDatetime,
            }
        case AiAgentNotificationType.ScrapingProcessingFinished:
            return {
                scrapingProcessingFinishedDatetime: receivedDatetime,
            }
        case AiAgentNotificationType.FirstAiAgentTicket:
            return {
                firstAiAgentTicketNotificationReceivedDatetime:
                    receivedDatetime,
                onboardingState: AiAgentOnboardingState.FullyOnboarded,
            }
        case AiAgentNotificationType.AiShoppingAssistantTrialRequest:
            const existingNotifications =
                onboardingNotificationState?.trialRequestNotification || []
            let updatedNotifications = [...existingNotifications]

            const existingUserIndex = updatedNotifications.findIndex(
                (request) => request.userId === agentId,
            )

            if (existingUserIndex >= 0) {
                updatedNotifications[existingUserIndex] = {
                    ...updatedNotifications[existingUserIndex],
                    receivedDatetime,
                    trialType: TrialType.ShoppingAssistant,
                }
            } else {
                updatedNotifications.push({
                    userId: agentId!,
                    receivedDatetime,
                    trialType: TrialType.ShoppingAssistant,
                })
            }

            return {
                trialRequestNotification: updatedNotifications,
            }
        case AiAgentNotificationType.AiAgentTrialRequest:
            const existingAiAgentNotifications =
                onboardingNotificationState?.trialRequestNotification || []
            let updatedAiAgentNotifications = [...existingAiAgentNotifications]

            const existingAiAgentUserIndex =
                updatedAiAgentNotifications.findIndex(
                    (request) => request.userId === agentId,
                )

            if (existingAiAgentUserIndex >= 0) {
                updatedAiAgentNotifications[existingAiAgentUserIndex] = {
                    ...updatedAiAgentNotifications[existingAiAgentUserIndex],
                    receivedDatetime,
                    trialType: TrialType.AiAgent,
                }
            } else {
                updatedAiAgentNotifications.push({
                    userId: agentId!,
                    receivedDatetime,
                    trialType: TrialType.AiAgent,
                })
            }

            return {
                trialRequestNotification: updatedAiAgentNotifications,
            }
        default:
            return {}
    }
}

export const isLessThan24HoursAgo = (datetimeString: string): boolean => {
    return moment().diff(moment(datetimeString), 'hours') < 24
}

export const isNotificationAlreadyReceived = (
    payload: AiAgentNotificationPayload,
    onboardingNotificationState?: OnboardingNotificationState,
) => {
    if (!onboardingNotificationState) {
        return false
    }

    const {
        ai_agent_notification_type: aiAgentNotificationType,
        agent_id: agentId,
    } = payload

    switch (aiAgentNotificationType) {
        case AiAgentNotificationType.StartAiAgentSetup:
            return !!onboardingNotificationState.startAiAgentSetupNotificationReceivedDatetime
        case AiAgentNotificationType.FinishAiAgentSetup:
            return !!onboardingNotificationState.finishAiAgentSetupNotificationReceivedDatetime
        case AiAgentNotificationType.ActivateAiAgent:
            return !!onboardingNotificationState.activateAiAgentNotificationReceivedDatetime
        case AiAgentNotificationType.MeetAiAgent:
            return !!onboardingNotificationState.meetAiAgentNotificationReceivedDatetime
        case AiAgentNotificationType.ScrapingProcessingFinished:
            return !!onboardingNotificationState.scrapingProcessingFinishedDatetime
        case AiAgentNotificationType.FirstAiAgentTicket:
            return !!onboardingNotificationState.firstAiAgentTicketNotificationReceivedDatetime
        case AiAgentNotificationType.AiShoppingAssistantTrialRequest:
            const trialRequest =
                onboardingNotificationState.trialRequestNotification?.find(
                    (trialRequest) =>
                        trialRequest.userId === agentId &&
                        isTrialNotificationOfType(
                            trialRequest,
                            TrialType.ShoppingAssistant,
                        ),
                )
            if (!trialRequest) {
                return false
            }
            return isLessThan24HoursAgo(trialRequest.receivedDatetime)
        case AiAgentNotificationType.AiAgentTrialRequest:
            const trialRequestAiAgent =
                onboardingNotificationState.trialRequestNotification?.find(
                    (trialRequest) =>
                        trialRequest.userId === agentId &&
                        isTrialNotificationOfType(
                            trialRequest,
                            TrialType.AiAgent,
                        ),
                )
            if (!trialRequestAiAgent) {
                return false
            }
            return isLessThan24HoursAgo(trialRequestAiAgent.receivedDatetime)
        default:
            return false
    }
}

export const getNotificationReceivedDatetime = (
    aiAgentNotificationType: AiAgentNotificationType,
    onboardingNotificationState: OnboardingNotificationState,
    userId?: number,
) => {
    switch (aiAgentNotificationType) {
        case AiAgentNotificationType.StartAiAgentSetup:
            return onboardingNotificationState.startAiAgentSetupNotificationReceivedDatetime
        case AiAgentNotificationType.FinishAiAgentSetup:
            return onboardingNotificationState.finishAiAgentSetupNotificationReceivedDatetime
        case AiAgentNotificationType.ActivateAiAgent:
            return onboardingNotificationState.activateAiAgentNotificationReceivedDatetime
        case AiAgentNotificationType.MeetAiAgent:
            return onboardingNotificationState.meetAiAgentNotificationReceivedDatetime
        case AiAgentNotificationType.ScrapingProcessingFinished:
            return onboardingNotificationState.scrapingProcessingFinishedDatetime
        case AiAgentNotificationType.FirstAiAgentTicket:
            return onboardingNotificationState.firstAiAgentTicketNotificationReceivedDatetime
        case AiAgentNotificationType.AiShoppingAssistantTrialRequest:
            return onboardingNotificationState.trialRequestNotification?.find(
                (trialRequest) =>
                    trialRequest.userId === userId &&
                    isTrialNotificationOfType(
                        trialRequest,
                        TrialType.ShoppingAssistant,
                    ),
            )?.receivedDatetime
        case AiAgentNotificationType.AiAgentTrialRequest:
            return onboardingNotificationState.trialRequestNotification?.find(
                (trialRequest) =>
                    trialRequest.userId === userId &&
                    isTrialNotificationOfType(trialRequest, TrialType.AiAgent),
            )?.receivedDatetime
        default:
            return null
    }
}

export const isTrialNotificationOfType = (
    trialRequest: TrialRequestNotification,
    trialType: TrialType,
) => {
    // we default to shopping assistant if trial type is not present because it was originally in database without type for this version
    if (!trialRequest.trialType) {
        return trialType === TrialType.ShoppingAssistant
    }

    return trialRequest.trialType === trialType
}
