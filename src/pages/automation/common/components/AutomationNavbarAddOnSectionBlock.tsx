import React, {useEffect} from 'react'
import {fromJS} from 'immutable'

import {getIconFromType} from 'state/integrations/helpers'
import {IntegrationType} from 'models/integration/constants'
import {
    SelfServiceIntegration,
    ShopifyIntegration,
} from 'models/integration/types'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import useAppDispatch from 'hooks/useAppDispatch'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

import AutomationNavbarAddOnPaywallViewItem from './AutomationNavbarAddOnPaywallViewItem'

type Props = {
    shopifyIntegration: ShopifyIntegration
    selfServiceIntegration?: SelfServiceIntegration
    onToggle: () => void
    isExpanded: boolean
}

const AutomationNavbarAddOnSectionBlock = ({
    shopifyIntegration,
    selfServiceIntegration,
    ...props
}: Props) => {
    const dispatch = useAppDispatch()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const shopName = shopifyIntegration.meta.shop_name

    useEffect(() => {
        if (!selfServiceIntegration) {
            void dispatch(
                updateOrCreateIntegration(
                    fromJS({
                        name: `Self-service for ${shopName}`,
                        type: IntegrationType.SelfService,
                        meta: {shop_name: shopName},
                        deactivated_datetime: null,
                    })
                )
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selfServiceIntegration])

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
                <AutomationNavbarAddOnPaywallViewItem isNested>
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
