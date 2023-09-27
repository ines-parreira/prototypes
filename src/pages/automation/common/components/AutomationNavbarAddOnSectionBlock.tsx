import React from 'react'
import classNames from 'classnames'

import cssNavbar from 'assets/css/navbar.less'
import {getIconFromType} from 'state/integrations/helpers'
import {ShopType} from 'models/selfServiceConfiguration/types'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {IntegrationType} from 'models/integration/constants'
import {assetsUrl} from 'utils'

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
            className={css.section}
            {...props}
        >
            {hasAutomationAddOn ? (
                <>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            to={`/app/automation/${shopType}/${shopName}/flows`}
                            isNested
                        >
                            <span className={cssNavbar['item-name']}>
                                Flow builder
                            </span>
                        </NavbarLink>
                    </div>
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                    >
                        <NavbarLink
                            to={`/app/automation/${shopType}/${shopName}/quick-responses`}
                            isNested
                        >
                            <span className={cssNavbar['item-name']}>
                                Quick response flows
                            </span>
                        </NavbarLink>
                    </div>
                </>
            ) : (
                <>
                    <AutomationNavbarAddOnPaywallNavbarLink
                        to="/app/automation/flows"
                        onSubscribeToAutomationAddOnClick={
                            onSubscribeToAutomationAddOnClick
                        }
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
                <div
                    className={classNames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested
                    )}
                >
                    <NavbarLink
                        to={`/app/automation/shopify/${shopName}/order-management`}
                        isNested
                    >
                        <span className={cssNavbar['item-name']}>
                            Order management flows
                        </span>
                    </NavbarLink>
                </div>
            )}
            {hasAutomationAddOn ? (
                <div
                    className={classNames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested
                    )}
                >
                    <NavbarLink
                        to={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                        isNested
                    >
                        <span className={cssNavbar['item-name']}>
                            Article recommendation
                        </span>
                    </NavbarLink>
                </div>
            ) : (
                <AutomationNavbarAddOnPaywallNavbarLink
                    to="/app/automation/article-recommendation"
                    onSubscribeToAutomationAddOnClick={
                        onSubscribeToAutomationAddOnClick
                    }
                    isNested
                >
                    <span className={cssNavbar['item-name']}>
                        Article recommendation
                    </span>
                </AutomationNavbarAddOnPaywallNavbarLink>
            )}
            <div
                className={classNames(
                    cssNavbar['link-wrapper'],
                    cssNavbar.isNested
                )}
            >
                <NavbarLink
                    to={`/app/automation/${shopType}/${shopName}/connected-channels`}
                    isNested
                >
                    <span className={cssNavbar['item-name']}>
                        Connected channels
                    </span>
                </NavbarLink>
            </div>
        </NavbarSectionBlock>
    )
}

export default AutomationNavbarAddOnSectionBlock
