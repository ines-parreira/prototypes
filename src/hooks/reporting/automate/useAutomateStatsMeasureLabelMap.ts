import {AutomationBillingEventMeasure} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {
    FLOWS,
    QUICK_RESPONSES as QUICK_RESPONSES_LABEL,
    ARTICLE_RECOMMENDATION as ARTICLE_RECOMMENDATION_LABEL,
} from 'pages/automate/common/components/constants'
import {AutomatedInteractionByFeatures} from 'pages/stats/types'

export enum DisplayEventType {
    AI_AGENT = 'AI Agent',
    WORKFLOWS = FLOWS,
    QUICK_RESPONSES_DEPRECATED = QUICK_RESPONSES_LABEL + ' (deprecated)',
    ARTICLE_RECOMMENDATION = ARTICLE_RECOMMENDATION_LABEL,
    TRACK_ORDER = 'Track order',
    RETURN_ORDER = 'Return order',
    REPORT_ORDER_ISSUE = 'Report order issue',
    AUTORESPONDERS = 'Autoresponders (deprecated)',
}

export const useAutomateStatsMeasureLabelMap = (): Record<
    AutomatedInteractionByFeatures,
    string
> => {
    return {
        [AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent]:
            DisplayEventType.AI_AGENT,
        [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponseFlows]:
            DisplayEventType.WORKFLOWS,
        [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse]:
            DisplayEventType.QUICK_RESPONSES_DEPRECATED,
        [AutomationBillingEventMeasure.AutomatedInteractionsByArticleRecommendation]:
            DisplayEventType.ARTICLE_RECOMMENDATION,
        [AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder]:
            DisplayEventType.TRACK_ORDER,
        [AutomationBillingEventMeasure.AutomatedInteractionsByLoopReturns]:
            DisplayEventType.RETURN_ORDER,
        [AutomationBillingEventMeasure.AutomatedInteractionsByAutomatedResponse]:
            DisplayEventType.REPORT_ORDER_ISSUE,
        [AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders]:
            DisplayEventType.AUTORESPONDERS,
    }
}
