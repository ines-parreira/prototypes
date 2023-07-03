import React from 'react'

import cssNavbar from 'assets/css/navbar.less'
import {getIconFromType} from 'state/integrations/helpers'
import {ShopType} from 'models/selfServiceConfiguration/types'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {IntegrationType} from 'models/integration/constants'
import {assetsUrl} from 'utils'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

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

    const getIconSrc = () => {
        switch (shopType) {
            case IntegrationType.BigCommerce:
                return assetsUrl('/img/integrations/bigcommerce-white.svg')
            default:
                return getIconFromType(shopType)
        }
    }

    return (
        <NavbarSectionBlock
            icon={
                <img
                    alt={`${shopType} logo`}
                    role="presentation"
                    src={getIconSrc()}
                />
            }
            {...props}
        >
            {hasAutomationAddOn ? (
                <>
                    <NavbarLink
                        to={`/app/automation/${shopType}/${shopName}/flows`}
                        isNested
                        title="Flow builder"
                    >
                        <span className={cssNavbar['item-name']}>
                            Flow builder
                        </span>
                        <Badge
                            type={ColorType.Blue}
                            className={cssNavbar.badge}
                        >
                            BETA
                        </Badge>
                    </NavbarLink>
                    <NavbarLink
                        to={`/app/automation/${shopType}/${shopName}/quick-responses`}
                        isNested
                        title="Quick response flows"
                    >
                        <span className={cssNavbar['item-name']}>
                            Quick response flows
                        </span>
                    </NavbarLink>
                </>
            ) : (
                <>
                    <AutomationNavbarAddOnPaywallNavbarLink
                        to="/app/automation/flows"
                        onSubscribeToAutomationAddOnClick={
                            onSubscribeToAutomationAddOnClick
                        }
                        title="Flow builder"
                        isNested
                    >
                        <span className={cssNavbar['item-name']}>
                            Flow builder
                        </span>
                    </AutomationNavbarAddOnPaywallNavbarLink>
                    <AutomationNavbarAddOnPaywallNavbarLink
                        to="/app/automation/quick-responses"
                        onSubscribeToAutomationAddOnClick={
                            onSubscribeToAutomationAddOnClick
                        }
                        isNested
                    >
                        <span className={cssNavbar['item-name']}>
                            Quick response flows
                        </span>
                    </AutomationNavbarAddOnPaywallNavbarLink>
                </>
            )}
            {shopType === 'shopify' && (
                <>
                    <NavbarLink
                        to={`/app/automation/shopify/${shopName}/order-management`}
                        isNested
                        title="Order management flows"
                    >
                        <span className={cssNavbar['item-name']}>
                            Order management flows
                        </span>
                    </NavbarLink>
                </>
            )}
            {hasAutomationAddOn ? (
                <NavbarLink
                    to={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                    isNested
                    title="Article recommendation"
                >
                    <span className={cssNavbar['item-name']}>
                        Article recommendation
                    </span>
                </NavbarLink>
            ) : (
                <AutomationNavbarAddOnPaywallNavbarLink
                    to="/app/automation/article-recommendation"
                    onSubscribeToAutomationAddOnClick={
                        onSubscribeToAutomationAddOnClick
                    }
                    isNested
                    title="Article recommendation"
                >
                    <span className={cssNavbar['item-name']}>
                        Article recommendation
                    </span>
                </AutomationNavbarAddOnPaywallNavbarLink>
            )}
            <NavbarLink
                to={`/app/automation/${shopType}/${shopName}/connected-channels`}
                isNested
                title="Connected channels"
            >
                <span className={cssNavbar['item-name']}>
                    Connected channels
                </span>
            </NavbarLink>
        </NavbarSectionBlock>
    )
}

export default AutomationNavbarAddOnSectionBlock
