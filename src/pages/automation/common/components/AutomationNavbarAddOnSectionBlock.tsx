import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {getIconFromType} from 'state/integrations/helpers'
import {ShopType} from 'models/selfServiceConfiguration/types'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import AutomationNavbarAddOnPaywallNavbarLink from './AutomationNavbarAddOnPaywallNavbarLink'

import css from './AutomationNavbarAddOnSectionBlock.less'

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
                <>
                    {isflowsBetaEnabled && (
                        <NavbarLink
                            to={`/app/automation/${shopType}/${shopName}/flows`}
                            className={css.workflowsNavbarLink}
                            isNested
                        >
                            Flows
                            <Badge
                                type={ColorType.Blue}
                                className={css.workflowsNavbarLinkBadge}
                            >
                                BETA
                            </Badge>
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
        </NavbarSectionBlock>
    )
}

export default AutomationNavbarAddOnSectionBlock
