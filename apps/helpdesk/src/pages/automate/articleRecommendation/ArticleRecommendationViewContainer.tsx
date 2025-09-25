import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { getHasAutomate } from 'state/billing/selectors'

import ArticleRecommendationView from './ArticleRecommendationView'

/**
 * @deprecated This page is not used anymore, it should be removed soon
 */
const ArticleRecommendationViewContainer = () => {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        )
    }

    return <ArticleRecommendationView />
}

export default ArticleRecommendationViewContainer
