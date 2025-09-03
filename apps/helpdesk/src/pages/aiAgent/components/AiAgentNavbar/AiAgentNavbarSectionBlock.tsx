import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { NavLink } from 'react-router-dom'

import { Badge } from '@gorgias/axiom'

import { Navigation } from 'components/Navigation/Navigation'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { ShopType } from 'models/selfServiceConfiguration/types'
import { OPPORTUNITIES, SALES, SETTINGS } from 'pages/aiAgent/constants'
import {
    NavigationItem,
    useAiAgentNavigation,
} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getIconFromType } from 'state/integrations/helpers'

import { isPreviewModeActivated } from '../StoreConfigForm/StoreConfigForm.utils'
import { SectionKey } from './utils'

import css from './AiAgentNavbarSectionBlock.less'

type AiAgentNavbarSectionBlockV2Props = {
    shopType: ShopType
    shopName: string
    shopKey: SectionKey
    name: string
    index: number
}
export const AiAgentNavbarSectionBlock = ({
    shopType,
    shopName,
    shopKey,
    name,
    index,
}: AiAgentNavbarSectionBlockV2Props) => {
    const { navigationItems, routes } = useAiAgentNavigation({ shopName })
    const onboardingState = useAiAgentOnboardingState(shopName)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeConfiguration } = useStoreConfiguration({
        shopName,
        accountDomain,
    })
    const isTrialModeAvailable = useFlag(FeatureFlagKey.AiAgentTrialMode)

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

    const { hasCurrentStoreTrialStarted, hasCurrentStoreTrialExpired } =
        useTrialAccess(storeConfiguration?.storeName)

    const itemName = (item: NavigationItem) => {
        switch (item.title) {
            case SALES:
                return (
                    <div className={css.item}>
                        {item.title}
                        {hasCurrentStoreTrialStarted &&
                            !hasCurrentStoreTrialExpired && (
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
            case OPPORTUNITIES:
                return (
                    <div className={css.item}>
                        <span>{item.title}</span>
                        <Badge type={'blue'}>NEW</Badge>
                    </div>
                )
            default:
                return item.title
        }
    }

    return (
        <Navigation.Section value={shopKey}>
            <Navigation.SectionTrigger>
                <div className={css.navigationTrigger}>
                    <img
                        alt={`${shopType} logo`}
                        role="presentation"
                        src={getIconFromType(shopType)}
                    />
                    {name}
                </div>

                <Navigation.SectionIndicator />
            </Navigation.SectionTrigger>
            <Navigation.SectionContent className={css.sectionContent}>
                {onboardingStatus === 'complete' &&
                    navigationItems?.map((item) => (
                        <Navigation.SectionItem
                            as={NavLink}
                            key={item.route}
                            to={item.route}
                            displayType="indent"
                            data-candu-id={
                                index === 0
                                    ? `${item.dataCanduId}-first-store`
                                    : item.dataCanduId
                            }
                        >
                            {itemName(item)}
                        </Navigation.SectionItem>
                    ))}
                {onboardingStatus === 'pending' && (
                    <Navigation.SectionItem
                        displayType="indent"
                        as={NavLink}
                        to={routes.onboardingWizard}
                    >
                        Get Started
                    </Navigation.SectionItem>
                )}
            </Navigation.SectionContent>
        </Navigation.Section>
    )
}
