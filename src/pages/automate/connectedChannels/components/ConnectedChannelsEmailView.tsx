import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {useParams} from 'react-router-dom'

import {AiAgentNotificationType} from 'automate/notifications/types'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    AiAgentOnboardingState,
    OnboardingNotificationState,
} from 'models/aiAgent/types'
import {isPreviewModeActivated} from 'pages/aiAgent/components/StoreConfigForm/StoreConfigForm.utils'
import {useAiAgentEnabled} from 'pages/aiAgent/hooks/useAiAgentEnabled'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {useAiAgentOnboardingNotification} from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import {useStoreConfiguration} from 'pages/aiAgent/hooks/useStoreConfiguration'
import {useStoreConfigurationMutation} from 'pages/aiAgent/hooks/useStoreConfigurationMutation'
import {isAiAgentEnabled} from 'pages/aiAgent/util'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'

import css from './ConnectedChannelsChatView.less'
import cssEmail from './ConnectedChannelsEmailView.less'
import {FeatureSettings} from './FeatureSettings'

export const ConnectedChannelsEmailView = () => {
    const isAiAgentOnboardingWizardEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizard]
    const isTrialModeAvailable = useFlags()[FeatureFlagKey.AiAgentTrialMode]

    const {shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const aiAgentNavigation = useAiAgentNavigation({shopName})

    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)

    const accountDomain = currentAccount.get('domain')

    const {storeConfiguration, isLoading} = useStoreConfiguration({
        shopName,
        accountDomain,
    })

    const {updateSettingsAfterAiAgentEnabled} = useAiAgentEnabled({
        monitoredEmailIntegrations:
            storeConfiguration?.monitoredEmailIntegrations ?? [],
        monitoredChatIntegrations:
            storeConfiguration?.monitoredChatIntegrations ?? [],
        isEnablingChatChannel: false,
        // Reverse the condition because this component update email channel without "Save" button how it works on Settings Page.
        // Linear to refactor this hook to support params in updateSettingsAfterAiAgentEnabled https://linear.app/gorgias/issue/AUTAI-1993/useaiagentenabled-hook-incorrectly-working-with-one-click-updates
        isEnablingEmailChannel: !(
            storeConfiguration?.emailChannelDeactivatedDatetime === null
        ),
    })

    const {
        upsertStoreConfiguration,
        error,
        isLoading: isUpserting,
    } = useStoreConfigurationMutation({
        shopName,
        accountDomain,
    })

    const {
        onboardingNotificationState,
        isLoading: isLoadingOnboardingNotificationState,
        handleOnSave,
        isAiAgentOnboardingNotificationEnabled,
        handleOnSendOrCancelNotification,
    } = useAiAgentOnboardingNotification({shopName})

    if (isLoading || isLoadingOnboardingNotificationState) {
        return (
            <div className={css.loadingContainer}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    const deactivatedDatetime =
        storeConfiguration?.emailChannelDeactivatedDatetime

    const isAIAgentToggled = isAiAgentEnabled(
        deactivatedDatetime !== undefined
            ? deactivatedDatetime
            : new Date().toISOString()
    )

    const isDisabled =
        !storeConfiguration ||
        storeConfiguration.monitoredEmailIntegrations.length === 0

    const hasPreviewModeActivated = isPreviewModeActivated({
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

    const previewModeDeactivationPayload = hasPreviewModeActivated
        ? {
              trialModeActivatedDatetime: null,
              previewModeActivatedDatetime: null,
              previewModeValidUntilDatetime: null,
          }
        : {}

    const handleActivatedAiAgent = async () => {
        if (!isAiAgentOnboardingNotificationEnabled) return

        const isFullyOnboarded =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.FullyOnboarded
        const isActivated =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.Activated

        if (isFullyOnboarded || isActivated) return

        handleOnSendOrCancelNotification({
            aiAgentNotificationType: AiAgentNotificationType.ActivateAiAgent,
            isCancel: true,
        })

        const payload: Partial<OnboardingNotificationState> = {
            onboardingState: AiAgentOnboardingState.Activated,
            firstActivationDatetime:
                onboardingNotificationState?.firstActivationDatetime ??
                new Date().toISOString(),
        }

        await handleOnSave(payload)
    }

    const onToggle = async (value: boolean) => {
        if (!storeConfiguration) return

        await upsertStoreConfiguration({
            ...storeConfiguration,
            ...previewModeDeactivationPayload,
            emailChannelDeactivatedDatetime: value
                ? null
                : new Date().toISOString(),
        })

        if (error) {
            void dispatch(
                notify({
                    message: 'Could not update store configuration',
                })
            )
        }
        if (!isAIAgentToggled && isAiAgentOnboardingWizardEnabled) {
            updateSettingsAfterAiAgentEnabled()
        }

        await handleActivatedAiAgent()
    }

    return (
        <div className={classNames('full-width', css.container)}>
            <div className={css.settingsContainer}>
                <div className={cssEmail.emailSettingsContainer}>
                    <FeatureSettings
                        title="AI Agent"
                        label="Enable AI Agent for email"
                        labelSubtitle="AI Agent uses Help Center articles, Macros, Guidance and Shopify data to automate responses, enabling your team to reduce wait time and increase customer satisfaction."
                        subtitle="When enabled, you can find tickets handled by AI Agent in a ticket view."
                        enabled={isAIAgentToggled}
                        externalLinkUrl={aiAgentNavigation.routes.main}
                        disabled={isDisabled}
                        showConfigurationRequiredAlert={isDisabled}
                        isLoading={isUpserting}
                        onToggle={onToggle}
                    />
                </div>
            </div>
        </div>
    )
}
