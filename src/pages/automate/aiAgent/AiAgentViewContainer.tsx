import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import Spinner from 'pages/common/components/Spinner'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {AiAgentConfigurationView} from './AiAgentConfigurationView/AiAgentConfigurationView'
import css from './AiAgentViewContainer.less'
import {AIAgentWelcomePageDynamic} from './AIAgentWelcomePageDynamic'
import {AIAgentWelcomePageView} from './components/AIAgentWelcomePageView/AIAgentWelcomePageView'
import {useWelcomePageAcknowledged} from './hooks/useWelcomePageAcknowledged'
import {useAiAgentStoreConfigurationContext} from './providers/AiAgentStoreConfigurationContext'

type WelcomePageFeatureFlag =
    | undefined
    | 'off'
    | 'dynamic_odd_static_even'
    | 'static_odd_dynamic_even'

const AiAgentViewContainer = () => {
    const {shopName, shopType} = useParams<{
        shopName: string
        shopType: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountId = currentAccount.get('id')
    const accountDomain = currentAccount.get('domain')

    const isAiAgentOnboardingWizardEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizard]

    const welcomePageFeatureFlag: WelcomePageFeatureFlag =
        useFlags()[FeatureFlagKey.AIAgentWelcomePage]

    const welcomePageAcknowledged = useWelcomePageAcknowledged({shopName})

    const {isLoading: isLoadingStoreConfiguration, storeConfiguration} =
        useAiAgentStoreConfigurationContext()

    if (isLoadingStoreConfiguration || welcomePageAcknowledged.isLoading) {
        return (
            <div className={css.spinner}>
                <Spinner size="big" />
            </div>
        )
    }

    const displayDynamicWelcomePage =
        (welcomePageFeatureFlag === 'dynamic_odd_static_even' ||
            welcomePageFeatureFlag === 'static_odd_dynamic_even') &&
        storeConfiguration === undefined &&
        welcomePageAcknowledged.data?.acknowledged !== true

    if (!isAiAgentOnboardingWizardEnabled && displayDynamicWelcomePage) {
        const showDynamic =
            (welcomePageFeatureFlag === 'dynamic_odd_static_even' &&
                accountId % 2 !== 0) ||
            (welcomePageFeatureFlag === 'static_odd_dynamic_even' &&
                accountId % 2 === 0)

        return showDynamic ? (
            <AIAgentWelcomePageDynamic
                state="dynamic"
                shopType={shopType}
                shopName={shopName}
            />
        ) : (
            <AIAgentWelcomePageView
                state="static"
                shopType={shopType}
                shopName={shopName}
            />
        )
    }

    const isOnUpdateOnboardingWizard =
        storeConfiguration?.wizard?.completedDatetime === null

    const displayOnboardingWizardWelcomePage =
        isAiAgentOnboardingWizardEnabled &&
        (!storeConfiguration || isOnUpdateOnboardingWizard)

    return displayOnboardingWizardWelcomePage ? (
        <AIAgentWelcomePageDynamic
            state="onboardingWizard"
            shopType={shopType}
            shopName={shopName}
            storeConfiguration={storeConfiguration}
        />
    ) : (
        <AiAgentConfigurationView
            accountDomain={accountDomain}
            shopName={shopName}
            shopType={shopType}
        />
    )
}

export default AiAgentViewContainer
