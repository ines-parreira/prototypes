import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { NavLink } from 'react-router-dom'

import { Badge } from '@gorgias/merchant-ui-kit'

import { Navigation } from 'components/Navigation/Navigation'
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
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getIconFromType } from 'state/integrations/helpers'

import { isPreviewModeActivated } from '../StoreConfigForm/StoreConfigForm.utils'
import { SectionKey } from './utils'

import css from './AiAgentNavbarSectionBlockV2.less'

type AiAgentNavbarSectionBlockV2Props = {
    shopType: ShopType
    shopName: string
    shopKey: SectionKey
    name: string
    index: number
}
export const AiAgentNavbarSectionBlockV2 = ({
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
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const isOnUsd5Plan = currentAutomatePlan?.generation === 5
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
                        {trialState === TrialState.Trial && isOnUsd5Plan && (
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
                        to={routes.main}
                    >
                        Get Started
                    </Navigation.SectionItem>
                )}
            </Navigation.SectionContent>
        </Navigation.Section>
    )
}
