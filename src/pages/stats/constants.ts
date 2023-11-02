import {AutomationBillingEventMeasure} from 'models/reporting/cubes/AutomationBillingEventCube'

import {AutomatedInteractionByFeatures} from './types'

export const FEATURE_LABELS: Record<AutomatedInteractionByFeatures, string> = {
    [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponseFlows]:
        'Flows',
    [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse]:
        'Quick response flows',
    [AutomationBillingEventMeasure.AutomatedInteractionsByArticleRecommendation]:
        'Article recommendation',
    [AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder]:
        'Track order',
    [AutomationBillingEventMeasure.AutomatedInteractionsByLoopReturns]:
        'Return order',
    [AutomationBillingEventMeasure.AutomatedInteractionsByAutomatedResponse]:
        'Report order issue',
    [AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders]:
        'Autoresponders',
}
