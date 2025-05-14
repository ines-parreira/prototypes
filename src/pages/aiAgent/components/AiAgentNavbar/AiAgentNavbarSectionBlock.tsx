import { useMemo } from 'react'

import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { ShopType } from 'models/selfServiceConfiguration/types'
import { SALES, SETTINGS } from 'pages/aiAgent/constants'
import {
    NavigationItem,
    useAiAgentNavigation,
} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import {
    getAiSalesAgentTrialState,
    TrialState,
} from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import NavbarLink from 'pages/common/components/navbar/NavbarLink'
import NavbarSectionBlock from 'pages/common/components/navbar/NavbarSectionBlock'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getIconFromType } from 'state/integrations/helpers'

import { isPreviewModeActivated } from '../StoreConfigForm/StoreConfigForm.utils'

import css from './AiAgentNavbarSectionBlock.less'

type Props = {
    shopType: ShopType
    shopName: string
    onToggle: () => void
    name: string
    isExpanded: boolean
    index?: number
}
export const AiAgentNavbarSectionBlock = ({
    shopType,
    shopName,
    index,
    name,
    onToggle,
    isExpanded,
}: Props) => {
    const { navigationItems, routes } = useAiAgentNavigation({ shopName })
    const onboardingState = useAiAgentOnboardingState(shopName)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeConfiguration } = useStoreConfiguration({
        shopName,
        accountDomain,
    })
    const isTrialModeAvailable = useFlags()[FeatureFlagKey.AiAgentTrialMode]

    const hasAiAgentTrialEnabled = isPreviewModeActivated({
        isPreviewModeActive: storeConfiguration?.isPreviewModeActive,
        isTrialModeAvailable: isTrialModeAvailable,
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
        (!storeConfiguration.emailChannelDeactivatedDatetime ||
            !storeConfiguration.chatChannelDeactivatedDatetime) &&
        !hasAiAgentTrialEnabled
    )

    type OnboardingStatus = 'loading' | 'complete' | 'pending'
    const onboardingStatus: OnboardingStatus = useMemo(() => {
        switch (onboardingState) {
            case OnboardingState.Loading:
                return 'loading'
            case OnboardingState.Onboarded:
                return 'complete'
            case OnboardingState.OnboardingWizard:
            default:
                return 'pending'
        }
    }, [onboardingState])

    let trialState: TrialState | undefined
    if (storeConfiguration) {
        trialState = getAiSalesAgentTrialState(storeConfiguration)
    }

    const itemName = (item: NavigationItem) => {
        switch (item.title) {
            case SALES:
                return (
                    <div className={css.item}>
                        {item.title}
                        {trialState === TrialState.Trial && (
                            <Badge
                                className={css.trialBadge}
                                type="light-success"
                            >
                                TRIAL
                            </Badge>
                        )}
                    </div>
                )
            case SETTINGS:
                return (
                    <div className={css.item}>
                        {item.title}
                        {hasAiAgentTrialEnabled && (
                            <Badge type={'magenta'}>PREVIEW</Badge>
                        )}
                        {hasAiAgentEnabled && (
                            <Badge type={'light-success'}>LIVE</Badge>
                        )}
                    </div>
                )
            default:
                return item.title
        }
    }

    return (
        <NavbarSectionBlock
            icon={
                <img
                    alt={`${shopType} logo`}
                    role="presentation"
                    src={getIconFromType(shopType)}
                />
            }
            className={css.section}
            onToggle={onToggle}
            name={name}
            isExpanded={onboardingStatus === 'loading' ? false : isExpanded}
        >
            {onboardingStatus === 'complete' &&
                navigationItems?.map((item) => (
                    <div
                        key={item.route}
                        className={classNames(
                            cssNavbar['link-wrapper'],
                            cssNavbar.isNested,
                        )}
                        {...(item.dataCanduId && {
                            ['data-candu-id']:
                                index === 0
                                    ? `${item.dataCanduId}-first-store`
                                    : item.dataCanduId,
                        })}
                    >
                        <NavbarLink to={item.route}>
                            <span className={cssNavbar['item-name']}>
                                {itemName(item)}
                            </span>
                        </NavbarLink>
                    </div>
                ))}
            {onboardingStatus === 'pending' && (
                <div
                    key={routes.main}
                    className={classNames(
                        cssNavbar['link-wrapper'],
                        cssNavbar.isNested,
                    )}
                >
                    <NavbarLink to={routes.main}>
                        <span className={cssNavbar['item-name']}>
                            Get Started
                        </span>
                    </NavbarLink>
                </div>
            )}
        </NavbarSectionBlock>
    )
}
