import React from 'react'
import classNames from 'classnames'

import {useFlags} from 'launchdarkly-react-client-sdk'
import cssNavbar from 'assets/css/navbar.less'
import {getIconFromType} from 'state/integrations/helpers'
import {ShopType} from 'models/selfServiceConfiguration/types'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {IntegrationType} from 'models/integration/constants'
import {assetsUrl} from 'utils'
import {FeatureFlagKey} from 'config/featureFlags'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import AutomateNavbarPaywallNavbarLink from './AutomateNavbarPaywallNavbarLink'
import css from './AutomateNavbarSectionBlock.less'
import {
    AI_AGENT,
    ARTICLE_RECOMMENDATION,
    CHANNELS,
    FLOWS,
    ORDER_MANAGEMENT,
    QUICK_RESPONSES,
    TRAIN_MY_AI,
} from './constants'

type Props = {
    shopType: ShopType
    shopName: string
    onToggle: () => void
    name: string
    isExpanded: boolean
    shouldRenderCanduIds: boolean
}
const FROM_LOCATION = 'automate-left-menu'
const AutomateNavbarSectionBlock = ({
    shopType,
    shopName,
    shouldRenderCanduIds,
    ...props
}: Props) => {
    const hasAutomate = useAppSelector(getHasAutomate)

    const hasAiAgentTrial = useFlags()[FeatureFlagKey.AiAgentTrialMode]
    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]

    const getIconSrc = () => {
        switch (shopType) {
            case IntegrationType.BigCommerce:
                return assetsUrl('/img/integrations/bigcommerce-white.svg')
            default:
                return getIconFromType(shopType)
        }
    }

    if (hasAiAgentTrial && !hasAutomate) {
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
                {shopType === 'shopify' && (
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                        {...(shouldRenderCanduIds && {
                            ['data-candu-id']: 'automate-link-ai-agent',
                        })}
                    >
                        <NavbarLink
                            to={{
                                pathname: `/app/automation/shopify/${shopName}/ai-agent`,
                                state: {from: FROM_LOCATION},
                            }}
                        >
                            <span className={cssNavbar['item-name']}>
                                {AI_AGENT}
                            </span>
                            <Badge
                                type={ColorType.Blue}
                                className={cssNavbar.badge}
                            >
                                NEW
                            </Badge>
                        </NavbarLink>
                    </div>
                )}
            </NavbarSectionBlock>
        )
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
            {hasAutomate ? (
                <>
                    {shopType === 'shopify' && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested
                            )}
                            {...(shouldRenderCanduIds && {
                                ['data-candu-id']: 'automate-link-ai-agent',
                            })}
                        >
                            <NavbarLink
                                to={{
                                    pathname: `/app/automation/shopify/${shopName}/ai-agent`,
                                    state: {from: FROM_LOCATION},
                                }}
                            >
                                <span className={cssNavbar['item-name']}>
                                    {AI_AGENT}
                                </span>
                                <Badge
                                    type={ColorType.Blue}
                                    className={cssNavbar.badge}
                                >
                                    NEW
                                </Badge>
                            </NavbarLink>
                        </div>
                    )}
                    <div
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested
                        )}
                        {...(shouldRenderCanduIds && {
                            ['data-candu-id']: 'automate-link-flows',
                        })}
                    >
                        <NavbarLink
                            to={{
                                pathname: `/app/automation/${shopType}/${shopName}/flows`,
                                state: {from: FROM_LOCATION},
                            }}
                        >
                            <span className={cssNavbar['item-name']}>
                                {FLOWS}
                            </span>
                        </NavbarLink>
                    </div>

                    {!isImprovedNavigationEnabled && (
                        <div
                            className={classNames(
                                cssNavbar['link-wrapper'],
                                cssNavbar.isNested
                            )}
                            {...(shouldRenderCanduIds && {
                                ['data-candu-id']:
                                    'automate-link-quick-responses',
                            })}
                        >
                            <NavbarLink
                                to={{
                                    pathname: `/app/automation/${shopType}/${shopName}/quick-responses`,
                                    state: {from: FROM_LOCATION},
                                }}
                            >
                                <span className={cssNavbar['item-name']}>
                                    {QUICK_RESPONSES}
                                </span>
                            </NavbarLink>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <AutomateNavbarPaywallNavbarLink
                        to="/app/automation/flows"
                        isNested
                    >
                        <span className={cssNavbar['item-name']}>{FLOWS}</span>
                    </AutomateNavbarPaywallNavbarLink>
                    {!isImprovedNavigationEnabled && (
                        <AutomateNavbarPaywallNavbarLink
                            to="/app/automation/quick-responses"
                            isNested
                        >
                            <span className={cssNavbar['item-name']}>
                                {QUICK_RESPONSES}
                            </span>
                        </AutomateNavbarPaywallNavbarLink>
                    )}
                </>
            )}
            {shopType === 'shopify' && (
                <div
                    className={classNames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested
                    )}
                    {...(shouldRenderCanduIds && {
                        ['data-candu-id']: 'automate-link-order-management',
                    })}
                >
                    <NavbarLink
                        to={{
                            pathname: `/app/automation/shopify/${shopName}/order-management`,
                            state: {from: FROM_LOCATION},
                        }}
                    >
                        <span className={cssNavbar['item-name']}>
                            {ORDER_MANAGEMENT}
                        </span>
                    </NavbarLink>
                </div>
            )}
            {hasAutomate ? (
                <div
                    className={classNames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested
                    )}
                    {...(shouldRenderCanduIds && {
                        ['data-candu-id']:
                            'automate-link-article-recommendation',
                    })}
                >
                    <NavbarLink
                        to={{
                            pathname: `/app/automation/${shopType}/${shopName}/article-recommendation`,
                            state: {from: FROM_LOCATION},
                        }}
                    >
                        <span className={cssNavbar['item-name']}>
                            {ARTICLE_RECOMMENDATION}
                        </span>
                    </NavbarLink>
                </div>
            ) : (
                <AutomateNavbarPaywallNavbarLink
                    to="/app/automation/article-recommendation"
                    isNested
                >
                    <span className={cssNavbar['item-name']}>
                        {ARTICLE_RECOMMENDATION}
                    </span>
                </AutomateNavbarPaywallNavbarLink>
            )}
            <div
                className={classNames(
                    cssNavbar['link-wrapper'],
                    cssNavbar.isNested
                )}
                {...(shouldRenderCanduIds && {
                    ['data-candu-id']: 'automate-link-connected-channels',
                })}
            >
                <NavbarLink
                    to={{
                        pathname: `/app/automation/${shopType}/${shopName}/connected-channels`,
                        state: {from: FROM_LOCATION},
                    }}
                >
                    <span className={cssNavbar['item-name']}>{CHANNELS}</span>
                </NavbarLink>
            </div>
            {!isImprovedNavigationEnabled && (
                <div
                    className={classNames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested
                    )}
                    {...(shouldRenderCanduIds && {
                        ['data-candu-id']: 'automate-link-train-my-ai',
                    })}
                >
                    <NavbarLink
                        to={{
                            pathname: `/app/automation/${shopType}/${shopName}/train-my-ai`,
                            state: {from: FROM_LOCATION},
                        }}
                    >
                        <span className={cssNavbar['item-name']}>
                            {TRAIN_MY_AI}
                        </span>
                    </NavbarLink>
                </div>
            )}
        </NavbarSectionBlock>
    )
}

export default AutomateNavbarSectionBlock
