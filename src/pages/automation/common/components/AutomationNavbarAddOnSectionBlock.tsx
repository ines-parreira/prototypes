import React from 'react'

import {getIconFromType} from 'state/integrations/helpers'
import {IntegrationType} from 'models/integration/constants'
import {ShopifyIntegration} from 'models/integration/types'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import AutomationNavbarAddOnPaywallViewItem from './AutomationNavbarAddOnPaywallViewItem'

type Props = {
    shopifyIntegration: ShopifyIntegration
    onToggle: () => void
    onSubscribeToAutomationAddOnClick: () => void
    isExpanded: boolean
}

const AutomationNavbarAddOnSectionBlock = ({
    shopifyIntegration,
    onSubscribeToAutomationAddOnClick,
    ...props
}: Props) => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const shopName = shopifyIntegration.meta.shop_name

    return (
        <NavbarSectionBlock
            name={shopName}
            icon={
                <img
                    alt="Shopify logo"
                    role="presentation"
                    src={getIconFromType(IntegrationType.Shopify)}
                />
            }
            {...props}
        >
            {hasAutomationAddOn ? (
                <NavbarLink
                    to={`/app/automation/self-service/shopify/${shopName}/preferences/quick-response`}
                    isNested
                >
                    Quick responses
                </NavbarLink>
            ) : (
                <AutomationNavbarAddOnPaywallViewItem
                    onSubscribeToAutomationAddOnClick={
                        onSubscribeToAutomationAddOnClick
                    }
                    isNested
                >
                    Quick responses
                </AutomationNavbarAddOnPaywallViewItem>
            )}
            <NavbarLink
                to={`/app/automation/self-service/shopify/${shopName}/preferences/order-management`}
                isNested
            >
                Order management
            </NavbarLink>
        </NavbarSectionBlock>
    )
}

export default AutomationNavbarAddOnSectionBlock
