import React from 'react'

import {getIconFromType} from 'state/integrations/helpers'
import {ShopType} from 'models/selfServiceConfiguration/types'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import AutomationNavbarAddOnPaywallNavbarLink from './AutomationNavbarAddOnPaywallNavbarLink'

type Props = {
    shopType: ShopType
    shopName: string
    onToggle: () => void
    onSubscribeToAutomationAddOnClick: () => void
    name: string
    isExpanded: boolean
}

const AutomationNavbarAddOnSectionBlock = ({
    shopType,
    shopName,
    onSubscribeToAutomationAddOnClick,
    ...props
}: Props) => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    return (
        <NavbarSectionBlock
            icon={
                <img
                    alt={`${shopType} logo`}
                    role="presentation"
                    src={getIconFromType(shopType)}
                />
            }
            {...props}
        >
            {hasAutomationAddOn ? (
                <NavbarLink
                    to={`/app/automation/${shopType}/${shopName}/quick-responses`}
                    isNested
                >
                    Quick responses
                </NavbarLink>
            ) : (
                <AutomationNavbarAddOnPaywallNavbarLink
                    to="/app/automation/quick-responses"
                    onSubscribeToAutomationAddOnClick={
                        onSubscribeToAutomationAddOnClick
                    }
                    isNested
                >
                    Quick responses
                </AutomationNavbarAddOnPaywallNavbarLink>
            )}
            {shopType === 'shopify' && (
                <NavbarLink
                    to={`/app/automation/self-service/shopify/${shopName}/preferences/order-management`}
                    isNested
                >
                    Order management
                </NavbarLink>
            )}
        </NavbarSectionBlock>
    )
}

export default AutomationNavbarAddOnSectionBlock
