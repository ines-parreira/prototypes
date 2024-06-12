import {Map} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'

import {getStoreIntegrations} from 'state/integrations/selectors'

import {getCurrentAutomatePlan} from 'state/billing/selectors'
import {FeatureFlagKey} from 'config/featureFlags'

const useQuickRepliesAlternativesLinks = (integration: Map<any, any>) => {
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)

    const storeIntegrations = useAppSelector(getStoreIntegrations)
    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]

    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
        ? Number(integration.getIn(['meta', 'shop_integration_id']))
        : undefined
    const storeIntegration = shopIntegrationId
        ? storeIntegrations.find(
              (storeIntegration) => storeIntegration.id === shopIntegrationId
          )
        : undefined

    const quickResponsesLink = storeIntegration
        ? `/app/automation/shopify/${storeIntegration.name}${
              isImprovedNavigationEnabled ? '/flows' : ''
          }/quick-responses`
        : undefined

    const flowsLink = storeIntegration
        ? `/app/automation/shopify/${storeIntegration.name}/flows`
        : undefined

    const installationTabLink = storeIntegration
        ? undefined
        : `/app/settings/channels/gorgias_chat/${
              integration.get('id') as string
          }/installation`

    return {
        showAlternatives: !!currentAutomatePlan,
        quickResponsesLink,
        flowsLink,
        installationTabLink,
    }
}

export default useQuickRepliesAlternativesLinks
