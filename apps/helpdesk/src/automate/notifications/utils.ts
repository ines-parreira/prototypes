import moment from 'moment'

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
    const { ai_agent_notification_type: aiAgentNotificationType } = payload
    const routes = getAiAgentNavigationRoutes(payload.shop_name)

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
                    "You're only a few steps away from getting AI Agent ready to start automating 60% of your tickets!",
                redirectTo: routes.onboardingWizard,
            }
        case AiAgentNotificationType.ActivateAiAgent:
            return {
                title: 'Activate AI Agent',
                subtitle:
                    "You're just one click away from automating 60% of your tickets!",
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
                subtitle: `We've finished syncing your store ${payload.shop_name} so AI Agent can use it to answer tickets.`,
                redirectTo: routes.knowledge,
            }
        case AiAgentNotificationType.FirstAiAgentTicket: {
            const { ticket_id: ticketId } = payload
            return {
                title: 'AI Agent answered its first ticket',
                subtitle:
                    "Review AI Agent's response and leave feedback in the ticket to improve its performance.",
                redirectTo:
                    aiAgentTicketViewId && ticketId
                        ? `/app/views/${aiAgentTicketViewId}/${ticketId}`
                        : '',
            }
        }
        case AiAgentNotificationType.AiShoppingAssistantTrialRequest: {
            const agent = getAgent(payload.agent_id)
            const agentName = agent?.name || 'Your team'
            return {
                title: 'New message',
                subtitle: `<b>Trial request</b> from <b>${agentName}</b>`,
                excerpt: `${agentName} has expressed interest in trying out the Shopping Assistant for 14 days at no additional cost.`,
                redirectTo: `/app/ai-agent/shopify/${payload.shop_name}/sales?from=notification`,
            }
        }
        case AiAgentNotificationType.AiAgentTrialRequest: {
            const agent = getAgent(payload.agent_id)
            const aiAgentName = agent?.name || 'Your team'
            return {
                title: 'New message',
                subtitle: `<b>Trial request</b> from <b>${aiAgentName}</b>`,
                excerpt: `${aiAgentName} wants to try out AI Agent for 14 days for ${payload.shop_name} for free.`,
                redirectTo: `/app/ai-agent/shopify/${payload.shop_name}/trial?from=notification`,
            }
        }
        case AiAgentNotificationType.NewOpportunityGenerated: {
            const {
                opportunity_ids: opportunityIds,
                total_tickets: totalTickets,
            } = payload
            if (!opportunityIds.length) return null
            const totalOpportunities = opportunityIds.length
            return {
                title: 'New opportunities to improve AI Agent',
                subtitle: `We found ${totalOpportunities} opportunities affecting ${totalTickets} tickets. Review and apply high-impact fixes to improve responses.`,
                redirectTo: routes.opportunitiesWithId(
                    opportunityIds[0].toString(),
                ),
            }
        }
        case AiAgentNotificationType.DomainSyncCompleted:
            return {
                title: 'Store website synced',
                subtitle:
                    'Your store website has been synced successfully and is in use by AI Agent. Review newly generated content for accuracy.',
                redirectTo: routes.knowledgeSourcesByDomain(payload.source_url),
            }
        case AiAgentNotificationType.DomainSyncFailed:
            return {
                title: 'Store website failed to sync',
                subtitle:
                    "We couldn't sync your store website. Please try again or contact support if the issue persists.",
                redirectTo: routes.knowledgeSourcesByDomain(payload.source_url),
            }
        case AiAgentNotificationType.UrlSyncCompleted:
            return {
                title: 'URL synced',
                subtitle:
                    'Your URL has been synced successfully and is in use by AI Agent. Review newly generated content for accuracy.',
                redirectTo: routes.knowledgeSourcesByUrl(payload.source_url),
            }
        case AiAgentNotificationType.UrlSyncFailed:
            return {
                title: 'URL failed to sync',
                subtitle:
                    "We couldn't sync one or more of your URLs. Make sure URLs are correct and publicly accessible.",
                redirectTo: routes.knowledgeSourcesByUrl(payload.source_url),
            }
        default:
            return null
    }
}

export const getNotificationReceivedDatetimePayload = (
    payload: AiAgentNotificationPayload,
    onboardingNotificationState?: OnboardingNotificationState,
): Partial<OnboardingNotificationState> => {
    const { ai_agent_notification_type: aiAgentNotificationType } = payload

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
        case AiAgentNotificationType.AiShoppingAssistantTrialRequest: {
            const { agent_id: agentId } = payload
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
                    userId: agentId,
                    receivedDatetime,
                    trialType: TrialType.ShoppingAssistant,
                })
            }

            return {
                trialRequestNotification: updatedNotifications,
            }
        }
        case AiAgentNotificationType.AiAgentTrialRequest: {
            const { agent_id: agentId } = payload
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
                    userId: agentId,
                    receivedDatetime,
                    trialType: TrialType.AiAgent,
                })
            }

            return {
                trialRequestNotification: updatedAiAgentNotifications,
            }
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

    const { ai_agent_notification_type: aiAgentNotificationType } = payload

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
        case AiAgentNotificationType.AiShoppingAssistantTrialRequest: {
            const trialRequest =
                onboardingNotificationState.trialRequestNotification?.find(
                    (trialRequest) =>
                        trialRequest.userId === payload.agent_id &&
                        isTrialNotificationOfType(
                            trialRequest,
                            TrialType.ShoppingAssistant,
                        ),
                )
            if (!trialRequest) {
                return false
            }
            return isLessThan24HoursAgo(trialRequest.receivedDatetime)
        }
        case AiAgentNotificationType.AiAgentTrialRequest: {
            const trialRequestAiAgent =
                onboardingNotificationState.trialRequestNotification?.find(
                    (trialRequest) =>
                        trialRequest.userId === payload.agent_id &&
                        isTrialNotificationOfType(
                            trialRequest,
                            TrialType.AiAgent,
                        ),
                )
            if (!trialRequestAiAgent) {
                return false
            }
            return isLessThan24HoursAgo(trialRequestAiAgent.receivedDatetime)
        }
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
