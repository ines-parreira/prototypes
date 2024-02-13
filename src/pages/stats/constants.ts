import {TicketChannel} from 'business/types/ticket'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/AutomationBillingEventCube'

import {
    ARTICLE_RECOMMENDATION,
    FLOWS,
    QUICK_RESPONSES,
} from 'pages/automate/common/components/constants'
import {AutomatedInteractionByFeatures} from './types'

export const FEATURE_LABELS: Record<AutomatedInteractionByFeatures, string> = {
    [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponseFlows]:
        FLOWS,
    [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse]:
        QUICK_RESPONSES,
    [AutomationBillingEventMeasure.AutomatedInteractionsByArticleRecommendation]:
        ARTICLE_RECOMMENDATION,
    [AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder]:
        'Track order',
    [AutomationBillingEventMeasure.AutomatedInteractionsByLoopReturns]:
        'Return order',
    [AutomationBillingEventMeasure.AutomatedInteractionsByAutomatedResponse]:
        'Report order issue',
    [AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders]:
        'Autoresponders',
}

export const DEFAULT_TIMEZONE = 'UTC'

export const AUTOMATION_INTENTS_CHANNELS = [
    TicketChannel.Api,
    TicketChannel.Chat,
    TicketChannel.Email,
    TicketChannel.Facebook,
    TicketChannel.FacebookMention,
    TicketChannel.FacebookMessenger,
    TicketChannel.InstagramAdComment,
    TicketChannel.InstagramComment,
    TicketChannel.Phone,
    TicketChannel.Sms,
]
