import {Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import {getStoreIntegrations} from 'state/integrations/selectors'

import {getCurrentAutomationProduct} from 'state/billing/selectors'

const useQuickRepliesAlternativesLinks = (integration: Map<any, any>) => {
    const automationProduct = useAppSelector(getCurrentAutomationProduct)

    const storeIntegrations = useAppSelector(getStoreIntegrations)
    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
        ? Number(integration.getIn(['meta', 'shop_integration_id']))
        : undefined
    const storeIntegration = shopIntegrationId
        ? storeIntegrations.find(
              (storeIntegration) => storeIntegration.id === shopIntegrationId
          )
        : undefined

    const quickResponsesLink = storeIntegration
        ? `/app/automation/shopify/${storeIntegration.name}/quick-responses`
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
        showAlternatives: !!automationProduct,
        quickResponsesLink,
        flowsLink,
        installationTabLink,
    }
}

export default useQuickRepliesAlternativesLinks
