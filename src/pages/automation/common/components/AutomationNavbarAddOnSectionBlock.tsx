import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {getIconFromType} from 'state/integrations/helpers'
import {ShopType} from 'models/selfServiceConfiguration/types'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {IntegrationType} from 'models/integration/constants'
import {assetsUrl} from 'utils'

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
    const isflowsBetaEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.FlowsBeta]

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
                    {isflowsBetaEnabled && (
                        <NavbarLink
                            to={`/app/automation/${shopType}/${shopName}/flows`}
                            isNested
                        >
                            Flows
                        </NavbarLink>
                    )}
                    <NavbarLink
                        to={`/app/automation/${shopType}/${shopName}/quick-responses`}
                        isNested
                    >
                        Quick responses
                    </NavbarLink>
                </>
            ) : (
                <>
                    {isflowsBetaEnabled && (
                        <AutomationNavbarAddOnPaywallNavbarLink
                            to="/app/automation/flows"
                            onSubscribeToAutomationAddOnClick={
                                onSubscribeToAutomationAddOnClick
                            }
                            isNested
                        >
                            Flows
                        </AutomationNavbarAddOnPaywallNavbarLink>
                    )}
                    <AutomationNavbarAddOnPaywallNavbarLink
                        to="/app/automation/quick-responses"
                        onSubscribeToAutomationAddOnClick={
                            onSubscribeToAutomationAddOnClick
                        }
                        isNested
                    >
                        Quick responses
                    </AutomationNavbarAddOnPaywallNavbarLink>
                </>
            )}
            {shopType === 'shopify' && (
                <>
                    <NavbarLink
                        to={`/app/automation/shopify/${shopName}/order-management`}
                        isNested
                    >
                        Order management
                    </NavbarLink>
                </>
            )}
            {hasAutomationAddOn ? (
                <NavbarLink
                    to={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                    isNested
                >
                    Article recommendation
                </NavbarLink>
            ) : (
                <AutomationNavbarAddOnPaywallNavbarLink
                    to="/app/automation/article-recommendation"
                    onSubscribeToAutomationAddOnClick={
                        onSubscribeToAutomationAddOnClick
                    }
                    isNested
                >
                    Article recommendation
                </AutomationNavbarAddOnPaywallNavbarLink>
            )}
            <NavbarLink
                to={`/app/automation/${shopType}/${shopName}/connected-channels`}
                isNested
            >
                Connected channels
            </NavbarLink>
        </NavbarSectionBlock>
    )
}

export default AutomationNavbarAddOnSectionBlock
