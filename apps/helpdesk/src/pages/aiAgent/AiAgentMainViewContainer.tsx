import React, { useCallback, useEffect } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AIAgentWelcomePageDynamic } from './AIAgentWelcomePageDynamic'
import { useAiAgentNavigation } from './hooks/useAiAgentNavigation'
import { useAiAgentOnboardingNotification } from './hooks/useAiAgentOnboardingNotification'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from './hooks/useAiAgentOnboardingState'
import { useAiAgentStoreConfigurationContext } from './providers/AiAgentStoreConfigurationContext'

import css from './components/AiAgentView/AiAgentView.less'

const AiAgentMainViewContainer = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })

    const { isLoading: isLoadingStoreConfiguration, storeConfiguration } =
        useAiAgentStoreConfigurationContext()

    const {
        isAdmin,
        isLoading: isLoadingOnboardingNotificationState,
        onboardingNotificationState,
        handleOnSave,
        isAiAgentOnboardingNotificationEnabled,
    } = useAiAgentOnboardingNotification({ shopName })

    const handleOnboardingState = useCallback(async () => {
        const isFullyOnboarded =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.FullyOnboarded

        const isActivated =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.Activated

        if (isFullyOnboarded || isActivated) return

        let onboardingState: AiAgentOnboardingState | null = null
        if (
            !!storeConfiguration?.previewModeActivatedDatetime ||
            storeConfiguration?.chatChannelDeactivatedDatetime === null ||
            storeConfiguration?.emailChannelDeactivatedDatetime === null
        ) {
            onboardingState = AiAgentOnboardingState.Activated
        } else if (
            !!storeConfiguration?.wizard?.completedDatetime ||
            (!!storeConfiguration && !storeConfiguration?.wizard)
        ) {
            onboardingState = AiAgentOnboardingState.FinishedSetup
        } else if (storeConfiguration?.wizard?.completedDatetime === null) {
            onboardingState = AiAgentOnboardingState.StartedSetup
        } else {
            onboardingState = AiAgentOnboardingState.VisitedAiAgent
        }

        if (onboardingState === onboardingNotificationState?.onboardingState)
            return

        await handleOnSave({ onboardingState })
    }, [
        handleOnSave,
        onboardingNotificationState?.onboardingState,
        storeConfiguration,
    ])

    useEffect(() => {
        if (
            isLoadingStoreConfiguration ||
            isLoadingOnboardingNotificationState ||
            !isAiAgentOnboardingNotificationEnabled ||
            !isAdmin
        )
            return

        void handleOnboardingState()
    }, [
        handleOnboardingState,
        isAdmin,
        isAiAgentOnboardingNotificationEnabled,
        isLoadingOnboardingNotificationState,
        isLoadingStoreConfiguration,
    ])

    const onboardingState = useAiAgentOnboardingState(
        shopName,
        isLoadingOnboardingNotificationState,
    )

    switch (onboardingState) {
        case OnboardingState.Loading:
            return (
                <div className={css.spinner} aria-label="loading">
                    <LoadingSpinner size="big" />
                </div>
            )
        case OnboardingState.OnboardingWizard:
            return (
                <AIAgentWelcomePageDynamic
                    accountDomain={accountDomain}
                    shopType={shopType}
                    shopName={shopName}
                    storeConfiguration={storeConfiguration}
                />
            )
        case OnboardingState.Onboarded:
            history.replace(routes.perShopOverview)
    }

    return null
}

export default AiAgentMainViewContainer
