import { Redirect } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { aiAgentRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import StoreIntegrationView from 'pages/automate/common/components/StoreIntegrationView'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export const AiAgentRedirect = () => {
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)
    const firstStore = storeIntegrations[0]

    const { hasAccess } = useAiAgentAccess(firstStore?.meta.shop_name)

    if (!firstStore) {
        return <StoreIntegrationView title="AI Agent" />
    }

    if (!hasAccess) {
        return (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.TrialSetup}
            />
        )
    }

    return <Redirect to={aiAgentRoutes.overview} />
}
