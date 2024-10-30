import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {ReactNode, useMemo} from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useId from 'hooks/useId'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {AI_AGENT} from 'pages/automate/common/components/constants'
import Button from 'pages/common/components/button/Button'
import ToggleInput from 'pages/common/forms/ToggleInput'

import history from 'pages/history'

import {useAccountStoreConfiguration} from '../../hooks/useAccountStoreConfiguration'
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

    const {aiAgentTicketViewId} = useAccountStoreConfiguration({
        storeNames: [shopName],
    })

    const {updateSettingsAfterAiAgentEnabled} = useAiAgentEnabled({
        monitoredEmailIntegrations:
            storeConfiguration?.monitoredEmailIntegrations ?? [],
        monitoredChatIntegrations:
            storeConfiguration?.monitoredChatIntegrations ?? [],
        isChatChanelEnabled: isAiAgentMultichannelEnablementEnabled
            ? storeConfiguration?.chatChannelDeactivatedDatetime === null
            : storeConfiguration?.deactivatedDatetime === null,
        isEmailChannelEnabled: isAiAgentMultichannelEnablementEnabled
            ? storeConfiguration?.emailChannelDeactivatedDatetime === null
            : storeConfiguration?.deactivatedDatetime === null,
    })

    const globalToggleAiAgentId = `global-toggle-ai-agent-${useId()}`

    const AiAgentTitle = useMemo(() => {
        return (
            <div className={css.customAiAgentTitle}>
                <h1 className="d-flex align-items-center">
                    {title ?? AI_AGENT}
                </h1>
                {aiAgentTicketViewId && (
                    <Button
                        size="small"
                        intent="secondary"
                        onClick={() => {
                            logEvent(SegmentEvent.AiAgentViewTicketsClicked)
                            history.push(`/app/views/${aiAgentTicketViewId}`, {
                                skipRedirect: true,
                            })
                        }}
                    >
                        View AI Agent Tickets
                    </Button>
                )}
            </div>
        )
    }, [aiAgentTicketViewId, title])

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
            title={AiAgentTitle}
            headerNavbarItems={headerNavbarItems}
            action={globalToggleAction}
            className={classnames(css.container, className)}
        >
            {children}
        </AutomateView>
    )
}
