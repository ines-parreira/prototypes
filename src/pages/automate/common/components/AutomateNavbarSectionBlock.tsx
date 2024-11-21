import classNames from 'classnames'

import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import cssNavbar from 'assets/css/navbar.less'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {ShopType} from 'models/selfServiceConfiguration/types'
import {useStoreConfiguration} from 'pages/automate/aiAgent/hooks/useStoreConfiguration'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import {getHasAutomate} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getIconFromType} from 'state/integrations/helpers'
import {assetsUrl} from 'utils'

import {isPreviewModeActivated} from '../../aiAgent/components/StoreConfigForm/StoreConfigForm.utils'
import AutomateNavbarPaywallNavbarLink from './AutomateNavbarPaywallNavbarLink'
import css from './AutomateNavbarSectionBlock.less'
import {
    AI_AGENT,
    ARTICLE_RECOMMENDATION,
    CHANNELS,
    FLOWS,
    ORDER_MANAGEMENT,
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

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const {storeConfiguration} = useStoreConfiguration({
        shopName,
        accountDomain,
    })

    const isTrialModeAvailable = useFlags()[FeatureFlagKey.AiAgentTrialMode]
    const hasAiAgentPreview =
        useFlags()[FeatureFlagKey.AIAgentPreviewModeAllowed]
    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]

    const hasAiAgentTrialEnabled = isPreviewModeActivated({
        isPreviewModeActive: storeConfiguration?.isPreviewModeActive,
        isTrialModeAvailable: isTrialModeAvailable,
        deactivatedDatetime: storeConfiguration?.deactivatedDatetime,
        emailChannelDeactivatedDatetime:
            storeConfiguration?.emailChannelDeactivatedDatetime,
        chatChannelDeactivatedDatetime:
            storeConfiguration?.chatChannelDeactivatedDatetime,
        trialModeActivatedDatetime:
            storeConfiguration?.trialModeActivatedDatetime,
        previewModeValidUntilDatetime:
            storeConfiguration?.previewModeValidUntilDatetime,
    })

    const hasAiAgentEnabled = !!(
        storeConfiguration &&
        (!storeConfiguration.deactivatedDatetime ||
            !storeConfiguration.emailChannelDeactivatedDatetime ||
            !storeConfiguration.chatChannelDeactivatedDatetime) &&
        !hasAiAgentTrialEnabled
    )

    const getIconSrc = () => {
        switch (shopType) {
            case IntegrationType.BigCommerce:
                return assetsUrl('/img/integrations/bigcommerce-white.svg')
            default:
                return getIconFromType(shopType)
        }
    }

    const PreviewBadge: React.FC = () => (
        <Badge type={ColorType.Magenta} className={cssNavbar.badge}>
            PREVIEW
        </Badge>
    )

    const LiveBadge: React.FC = () => (
        <Badge type={ColorType.LightSuccess} className={cssNavbar.badge}>
            LIVE
        </Badge>
    )

    if (hasAiAgentPreview && !hasAutomate) {
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
                            {hasAiAgentTrialEnabled && <PreviewBadge />}
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
                                {hasAiAgentTrialEnabled && <PreviewBadge />}
                                {hasAiAgentEnabled && <LiveBadge />}
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
                </>
            ) : (
                <>
                    <AutomateNavbarPaywallNavbarLink
                        to="/app/automation/flows"
                        isNested
                    >
                        <span className={cssNavbar['item-name']}>{FLOWS}</span>
                    </AutomateNavbarPaywallNavbarLink>
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
