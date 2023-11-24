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
