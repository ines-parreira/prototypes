import React, { useCallback, useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import {
    Link as AxiomLink,
    LegacyLoadingSpinner as LoadingSpinner,
    Text,
} from '@gorgias/axiom'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { ChannelToggle } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/ChannelToggle'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import css from './EmailToggle.less'

type EmailToggleProps = {
    isEmailChannelEnabled: boolean
    isLoading: boolean
    isReadOnly?: boolean
    showTrialGateWarning?: boolean
    storeConfiguration?: StoreConfiguration
    shopName: string
    label?: string

    setIsEmailChannelEnabled: (value: boolean) => void
    onEmailToggle: (storeConfiguration: StoreConfiguration) => void
    onStartTrial?: () => void
}

export const EmailToggle = ({
    isEmailChannelEnabled,
    isLoading,
    isReadOnly = false,
    showTrialGateWarning = false,
    storeConfiguration,
    shopName,
    setIsEmailChannelEnabled,
    onEmailToggle,
    onStartTrial,
    label = 'Email',
}: EmailToggleProps) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const history = useHistory()

    const isEmailChannelDisabled = useMemo(() => {
        const monitoredEmailIntegrations =
            storeConfiguration?.monitoredEmailIntegrations || []

        return !Boolean(monitoredEmailIntegrations.length)
    }, [storeConfiguration?.monitoredEmailIntegrations])

    const handleEmailToggle = () => {
        if (!storeConfiguration) return

        setIsEmailChannelEnabled(true)
        onEmailToggle({
            ...storeConfiguration,
            emailChannelDeactivatedDatetime: null,
        })
    }

    const renderEmailWarning = useCallback(() => {
        const action = isEmailChannelDisabled ? (
            <div className={css.customToggleWarning}>
                <Text size="sm" variant="regular">
                    <AxiomLink
                        size="sm"
                        onClick={() => history.push(routes.deployEmail)}
                    >
                        Connect an email address
                    </AxiomLink>{' '}
                    to enable the AI Agent
                </Text>
            </div>
        ) : showTrialGateWarning ? (
            <div className={css.customToggleWarning}>
                <Text size="sm" variant="regular">
                    Your email is connected, but you need to{' '}
                    <AxiomLink size="sm" onClick={onStartTrial}>
                        start a trial
                    </AxiomLink>{' '}
                    before you can deploy
                </Text>
            </div>
        ) : null

        return {
            visible: isEmailChannelDisabled || showTrialGateWarning,
            hint: '',
            action,
        }
    }, [
        history,
        routes.deployEmail,
        isEmailChannelDisabled,
        showTrialGateWarning,
        onStartTrial,
    ])

    return (
        <div className={css.toggleContainer}>
            <ChannelToggle
                className={css.customToggle}
                color="var(--surface-inverted-default)"
                label={
                    <Text size="md" variant="regular">
                        {label}
                    </Text>
                }
                checked={isEmailChannelEnabled}
                disabled={isEmailChannelDisabled || isLoading || isReadOnly}
                onChange={handleEmailToggle}
                warnings={[renderEmailWarning()]}
                tooltip={{
                    visible: false,
                    content: '',
                }}
            />
            {isEmailChannelEnabled && isLoading && (
                <LoadingSpinner size="small" />
            )}
        </div>
    )
}
