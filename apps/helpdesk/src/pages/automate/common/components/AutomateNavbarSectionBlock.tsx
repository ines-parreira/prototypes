import { FeatureFlagKey } from '@repo/feature-flags'
import classNames from 'classnames'

import { LegacyBadge as Badge } from '@gorgias/axiom'

import cssNavbar from 'assets/css/navbar.less'
import { useFlag } from 'core/flags'
import { THEME_NAME, useTheme } from 'core/theme'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type { ShopType } from 'models/selfServiceConfiguration/types'
import { isPreviewModeActivated } from 'pages/aiAgent/components/StoreConfigForm/StoreConfigForm.utils'
import { AI_AGENT } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getIconFromType } from 'state/integrations/helpers'
import { assetsUrl } from 'utils'

import AutomateNavbarPaywallNavbarLink from './AutomateNavbarPaywallNavbarLink'
import {
    ARTICLE_RECOMMENDATION,
    CHANNELS,
    FLOWS,
    ORDER_MANAGEMENT,
} from './constants'

import css from './AutomateNavbarSectionBlock.less'

type Props = {
    shopType: ShopType
    shopName: string
    onToggle: () => void
    name: string
    isExpanded: boolean
    shouldRenderCanduIds: boolean
}
const FROM_LOCATION = 'automate-left-menu'

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
const AutomateNavbarSectionBlock = ({
    shopType,
    shopName,
    shouldRenderCanduIds,
    ...props
}: Props) => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const theme = useTheme()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeConfiguration } = useStoreConfiguration({
        shopName,
        accountDomain,
    })

    const { routes: aiAgentRoutes } = useAiAgentNavigation({ shopName })

    const hasAiAgentPreview = useFlag(FeatureFlagKey.AIAgentPreviewModeAllowed)

    const hasAiAgentTrialEnabled = isPreviewModeActivated({
        isPreviewModeActive: storeConfiguration?.isPreviewModeActive,
        emailChannelDeactivatedDatetime:
            storeConfiguration?.emailChannelDeactivatedDatetime,
        chatChannelDeactivatedDatetime:
            storeConfiguration?.chatChannelDeactivatedDatetime,
        previewModeValidUntilDatetime:
            storeConfiguration?.previewModeValidUntilDatetime,
    })

    const hasAiAgentEnabled = !!(
        storeConfiguration &&
        (!storeConfiguration.emailChannelDeactivatedDatetime ||
            !storeConfiguration.chatChannelDeactivatedDatetime) &&
        !hasAiAgentTrialEnabled
    )

    const getIconSrc = () => {
        switch (shopType) {
            case IntegrationType.BigCommerce:
                return assetsUrl(
                    `/img/integrations/bigcommerce${theme.resolvedName === THEME_NAME.Dark ? '-white' : ''}.svg`,
                )
            default:
                return getIconFromType(shopType)
        }
    }

    const PreviewBadge: React.FC = () => (
        <Badge type={'magenta'} className={cssNavbar.badge}>
            PREVIEW
        </Badge>
    )

    const LiveBadge: React.FC = () => (
        <Badge type={'light-success'} className={cssNavbar.badge}>
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
                            cssNavbar.isNested,
                        )}
                        {...(shouldRenderCanduIds && {
                            ['data-candu-id']: 'automate-link-ai-agent',
                        })}
                    >
                        <NavbarLink
                            to={{
                                pathname: aiAgentRoutes.main,
                                state: { from: FROM_LOCATION },
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
                                cssNavbar.isNested,
                            )}
                            {...(shouldRenderCanduIds && {
                                ['data-candu-id']: 'automate-link-ai-agent',
                            })}
                        >
                            <NavbarLink
                                to={{
                                    pathname: aiAgentRoutes.main,
                                    state: { from: FROM_LOCATION },
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
                            cssNavbar.isNested,
                        )}
                        {...(shouldRenderCanduIds && {
                            ['data-candu-id']: 'automate-link-flows',
                        })}
                    >
                        <NavbarLink
                            to={{
                                pathname: `/app/automation/${shopType}/${shopName}/flows`,
                                state: { from: FROM_LOCATION },
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
                        cssNavbar.isNested,
                    )}
                    {...(shouldRenderCanduIds && {
                        ['data-candu-id']: 'automate-link-order-management',
                    })}
                >
                    <NavbarLink
                        to={{
                            pathname: `/app/automation/shopify/${shopName}/order-management`,
                            state: { from: FROM_LOCATION },
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
                        cssNavbar.isNested,
                    )}
                    {...(shouldRenderCanduIds && {
                        ['data-candu-id']:
                            'automate-link-article-recommendation',
                    })}
                >
                    <NavbarLink
                        to={{
                            pathname: `/app/automation/${shopType}/${shopName}/article-recommendation`,
                            state: { from: FROM_LOCATION },
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
                    cssNavbar.isNested,
                )}
                {...(shouldRenderCanduIds && {
                    ['data-candu-id']: 'automate-link-connected-channels',
                })}
            >
                <NavbarLink
                    to={{
                        pathname: `/app/automation/${shopType}/${shopName}/connected-channels`,
                        state: { from: FROM_LOCATION },
                    }}
                >
                    <span className={cssNavbar['item-name']}>{CHANNELS}</span>
                </NavbarLink>
            </div>
        </NavbarSectionBlock>
    )
}

export default AutomateNavbarSectionBlock
