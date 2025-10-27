import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { HelpCenterAutomateType } from 'models/helpCenter/types'
import { IntegrationType } from 'models/integration/constants'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

const useGetAutomateType = (): HelpCenterAutomateType => {
    const { hasAccess } = useAiAgentAccess()

    const allStoreIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

    if (!hasAccess) return HelpCenterAutomateType.NON_AUTOMATE

    if (!allStoreIntegrations?.length)
        return HelpCenterAutomateType.AUTOMATE_NO_STORE

    return HelpCenterAutomateType.AUTOMATE
}

export default useGetAutomateType
