import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {
    FLOWS,
    QUICK_RESPONSES,
    ARTICLE_RECOMMENDATION,
} from 'pages/automate/common/components/constants'
import {AutomatedInteractionByFeatures} from 'pages/stats/types'

export const useAutomateStatsMeasureLabelMap = (): Record<
    AutomatedInteractionByFeatures,
    string
> => {
    const isSunsetQuickResponses =
        useFlags()[FeatureFlagKey.SunsetQuickResponses]
    return {
        [AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent]:
            'AI Agent',
        [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponseFlows]:
            FLOWS,
        [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse]:
            QUICK_RESPONSES + (isSunsetQuickResponses ? ' (deprecated)' : ''),
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
}
