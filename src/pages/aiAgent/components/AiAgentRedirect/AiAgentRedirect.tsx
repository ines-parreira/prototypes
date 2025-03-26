import { Redirect } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import {
    aiAgentRoutes,
    useAiAgentNavigation,
} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import StoreIntegrationView from 'pages/automate/common/components/StoreIntegrationView'
import { getHasAutomate } from 'state/billing/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import css from './AiAgentRedirect.less'

export const AiAgentRedirect = () => {
    const hasStandaloneConvAiOverviewPage = useFlag(
        FeatureFlagKey.StandaloneConvAiOverviewPage,
        null, // null means FF is not set yet
    )

    const hasAutomate = useAppSelector(getHasAutomate)
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const firstStore = storeIntegrations[0]
    const aiAgentNavigation = useAiAgentNavigation({
        shopName: firstStore?.name ?? '',
    })

    const isLoading = hasStandaloneConvAiOverviewPage === null

    if (isLoading) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    if (!hasAutomate) {
        return (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        )
    }

    if (!firstStore) {
        return <StoreIntegrationView title="AI Agent" />
    }

    if (hasStandaloneConvAiOverviewPage) {
        return <Redirect to={aiAgentRoutes.overview} />
    }

    return <Redirect to={aiAgentNavigation.routes.main} />
}
