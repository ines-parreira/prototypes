import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {ReactNode, useMemo} from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useId from 'hooks/useId'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {AI_AGENT} from 'pages/automate/common/components/constants'
import ToggleInput from 'pages/common/forms/ToggleInput'

import {useAiAgentEnabled} from '../../hooks/useAiAgentEnabled'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import {useAiAgentStoreConfigurationContext} from '../../providers/AiAgentStoreConfigurationContext'
import css from './AiAgentLayout.less'

type Props = {
    children: ReactNode
    shopName: string
    className?: string
    title?: ReactNode
    isLoading?: boolean
}

export const AiAgentLayout = ({
    shopName,
    className,
    children,
    title,
    isLoading,
}: Props) => {
    const trialModeAvailable = useFlags()[FeatureFlagKey.AiAgentTrialMode]
    const isAiAgentOnboardingWizardEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizard]
    const isAiAgentMultichannelEnablementEnabled =
        useFlags()[FeatureFlagKey.AiAgentMultiChannelEnablement]

    const {headerNavbarItems} = useAiAgentNavigation({shopName})

    const {
        storeConfiguration,
        isLoading: isLoadingStoreConfiguration,
        updateStoreConfiguration,
        isPendingCreateOrUpdate,
    } = useAiAgentStoreConfigurationContext()

    const {updateSettingsAfterAiAgentEnabled} = useAiAgentEnabled(
        storeConfiguration?.monitoredEmailIntegrations ?? [],
        storeConfiguration?.monitoredChatIntegrations ?? []
    )

    const globalToggleAiAgentId = `global-toggle-ai-agent-${useId()}`

    const globalToggleAction = useMemo(() => {
        if (isAiAgentMultichannelEnablementEnabled) {
            return undefined
        }

        if (isLoadingStoreConfiguration || storeConfiguration === undefined) {
            return undefined
        }

        if (trialModeAvailable) {
            return undefined
        }

        return (
            <ToggleInput
                isToggled={storeConfiguration.deactivatedDatetime === null}
                isDisabled={isPendingCreateOrUpdate}
                onClick={async (isEnabled: boolean) => {
                    await updateStoreConfiguration({
                        ...storeConfiguration,
                        deactivatedDatetime:
                            storeConfiguration.deactivatedDatetime === null
                                ? new Date().toISOString()
                                : null,
                    })

                    if (isEnabled) {
                        logEvent(SegmentEvent.AiAgentEnabled, {
                            store: shopName,
                        })
                    }

                    if (isEnabled && isAiAgentOnboardingWizardEnabled) {
                        updateSettingsAfterAiAgentEnabled()
                    }
                }}
                name={globalToggleAiAgentId}
                dataCanduId="global-ai-agent-configuration-toggle"
            >
                Enable AI Agent
            </ToggleInput>
        )
    }, [
        isAiAgentMultichannelEnablementEnabled,
        isLoadingStoreConfiguration,
        storeConfiguration,
        trialModeAvailable,
        isPendingCreateOrUpdate,
        globalToggleAiAgentId,
        updateStoreConfiguration,
        isAiAgentOnboardingWizardEnabled,
        shopName,
        updateSettingsAfterAiAgentEnabled,
    ])

    return (
        <AutomateView
            isLoading={isLoading}
            title={title ?? AI_AGENT}
            headerNavbarItems={headerNavbarItems}
            action={globalToggleAction}
            className={classnames(css.container, className)}
        >
            {children}
        </AutomateView>
    )
}
