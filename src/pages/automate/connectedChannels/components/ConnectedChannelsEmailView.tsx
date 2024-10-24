import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {useAiAgentEnabled} from 'pages/automate/aiAgent/hooks/useAiAgentEnabled'
import {useStoreConfiguration} from 'pages/automate/aiAgent/hooks/useStoreConfiguration'
import {useStoreConfigurationMutation} from 'pages/automate/aiAgent/hooks/useStoreConfigurationMutation'
import {isAiAgentEnabled} from 'pages/automate/aiAgent/util'
import Spinner from 'pages/common/components/Spinner'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'

import css from './ConnectedChannelsChatView.less'
import cssEmail from './ConnectedChannelsEmailView.less'
import {FeatureSettings} from './FeatureSettings'

export const ConnectedChannelsEmailView = () => {
    const isAiAgentOnboardingWizardEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizard]

    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const dispatch = useDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)

    const accountDomain = currentAccount.get('domain')

    const {storeConfiguration, isLoading} = useStoreConfiguration({
        shopName,
        accountDomain,
    })

    const {updateSettingsAfterAiAgentEnabled} = useAiAgentEnabled(
        storeConfiguration?.monitoredEmailIntegrations ?? [],
        storeConfiguration?.monitoredChatIntegrations ?? []
    )

    const {
        upsertStoreConfiguration,
        error,
        isLoading: isUpserting,
    } = useStoreConfigurationMutation({
        shopName,
        accountDomain,
    })

    if (isLoading) {
        return (
            <div className={css.loadingContainer}>
                <Spinner color="dark" size="big" />
            </div>
        )
    }

    const isAIAgentToggled = isAiAgentEnabled(
        storeConfiguration?.deactivatedDatetime !== undefined
            ? storeConfiguration.deactivatedDatetime
            : new Date().toISOString()
    )

    const isDisabled = !storeConfiguration

    return (
        <div className={classNames('full-width', css.container)}>
            <div className={css.settingsContainer}>
                <div className={cssEmail.emailSettingsContainer}>
                    <FeatureSettings
                        title="AI Agent"
                        label="Enable AI agent for email"
                        labelSubtitle="AI Agent uses Help Center articles, Macros, Guidance and Shopify data to automate responses, enabling your team to reduce wait time and increase customer satisfaction."
                        subtitle="When enabled, you can find tickets handled by AI Agent in a ticket view."
                        enabled={isAIAgentToggled}
                        externalLinkUrl={`/app/automation/${shopType}/${shopName}/ai-agent`}
                        disabled={isDisabled}
                        showConfigurationRequiredAlert={isDisabled}
                        isLoading={isUpserting}
                        onToggle={async (value) => {
                            if (!storeConfiguration) return
                            await upsertStoreConfiguration({
                                ...storeConfiguration,
                                trialModeActivatedDatetime: null,
                                deactivatedDatetime: value
                                    ? null
                                    : new Date().toISOString(),
                            })
                            if (error) {
                                dispatch(
                                    notify({
                                        message:
                                            'Could not update store configuration',
                                    })
                                )
                            }
                            if (
                                !isAIAgentToggled &&
                                isAiAgentOnboardingWizardEnabled
                            ) {
                                updateSettingsAfterAiAgentEnabled()
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
