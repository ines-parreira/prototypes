import { useMemo } from 'react'

import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import type {
    BigCommerceIntegration,
    GorgiasChatIntegration,
    Magento2Integration,
    ShopifyIntegration,
} from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import type { Value } from 'pages/common/forms/SelectField/types'
import { StoreNameDropdown } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/StoreNameDropdown'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export type HelpCenterContactFormIntegrationTypes =
    | BigCommerceIntegration
    | ShopifyIntegration
    | Magento2Integration

export default (props: {
    handleStoreChange: (
        integration: HelpCenterContactFormIntegrationTypes,
    ) => void
    shopName?: string | null
    shopIntegrationId?: number | null
    isDisabled?: boolean
    gorgiasChatIntegrations?: GorgiasChatIntegration[]
}) => {
    const {
        shopName,
        shopIntegrationId,
        handleStoreChange,
        isDisabled,
        gorgiasChatIntegrations,
    } = props

    const integrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

    const selectedIntegrationId = useMemo(() => {
        return (
            integrations.find(
                (integ) =>
                    integ.name === shopName || integ.id === shopIntegrationId,
            )?.id || null
        )
    }, [integrations, shopName, shopIntegrationId])

    const setSelectedIntegration = (integrationId: Value) => {
        const selectedIntegration = integrations.find(
            (integ) => integ.id === integrationId,
        )
        if (selectedIntegration) handleStoreChange(selectedIntegration)
    }

    return (
        <StoreNameDropdown
            selectLabel="Select a store"
            storeIntegrations={fromJS(integrations)}
            onChange={setSelectedIntegration}
            isDisabled={isDisabled}
            storeIntegrationId={selectedIntegrationId}
            gorgiasChatIntegrations={fromJS(gorgiasChatIntegrations || [])}
        />
    )
}
