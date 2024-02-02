import useAppSelector from 'hooks/useAppSelector'
import {HelpCenterAutomateType} from 'models/helpCenter/types'
import {IntegrationType} from 'models/integration/constants'
import {getHasAutomate} from 'state/billing/selectors'
import {getIntegrationsByTypes} from 'state/integrations/selectors'

const useGetAutomateType = (): HelpCenterAutomateType => {
    const hasAutomate = useAppSelector(getHasAutomate)

    const allStoreIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ])
    )

    if (!hasAutomate) return HelpCenterAutomateType.NON_AUTOMATE

    if (!allStoreIntegrations?.length)
        return HelpCenterAutomateType.AUTOMATE_NO_STORE

    return HelpCenterAutomateType.AUTOMATE
}

export default useGetAutomateType
