import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {useHistory, useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import css from './AiAgentViewContainer.less'
import {AIAgentWelcomePageDynamic} from './AIAgentWelcomePageDynamic'
import {AIAgentWelcomePageView} from './components/AIAgentWelcomePageView/AIAgentWelcomePageView'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from './hooks/useAiAgentOnboardingState'
import {useAiAgentStoreConfigurationContext} from './providers/AiAgentStoreConfigurationContext'

const AiAgentViewContainer = () => {
    const {shopName, shopType} = useParams<{
        shopName: string
        shopType: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const history = useHistory()
    const {routes} = useAiAgentNavigation({shopName})

    const isAiAgentOptimizeTabEnabled =
        useFlags()[FeatureFlagKey.AiAgentOptimizeTab]

    const {storeConfiguration} = useAiAgentStoreConfigurationContext()

    const onboardingState = useAiAgentOnboardingState(shopName)

    switch (onboardingState) {
        case OnboardingState.Loading:
            return (
                <div className={css.spinner}>
                    <LoadingSpinner size="big" />
                </div>
            )
        case OnboardingState.WelcomeDynamic:
            return (
                <AIAgentWelcomePageDynamic
                    state="dynamic"
                    accountDomain={accountDomain}
                    shopType={shopType}
                    shopName={shopName}
                />
            )
        case OnboardingState.WelcomeStatic:
            return (
                <AIAgentWelcomePageView
                    state="static"
                    accountDomain={accountDomain}
                    shopType={shopType}
                    shopName={shopName}
                />
            )
        case OnboardingState.OnboardingWizard:
            return (
                <AIAgentWelcomePageDynamic
                    state="onboardingWizard"
                    accountDomain={accountDomain}
                    shopType={shopType}
                    shopName={shopName}
                    storeConfiguration={storeConfiguration}
                />
            )
        case OnboardingState.Onboarded:
            history.replace(
                isAiAgentOptimizeTabEnabled
                    ? routes.optimize
                    : routes.configuration()
            )
    }

    return null
}

export default AiAgentViewContainer
