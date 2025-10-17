import React, { useCallback, useMemo } from 'react'

import { Link } from 'react-router-dom'

import { LoadingSpinner, Text } from '@gorgias/axiom'

import { StoreConfiguration } from 'models/aiAgent/types'
import { ChannelToggle } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/ChannelToggle'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import css from './EmailToggle.less'

type EmailToggleProps = {
    isEmailChannelEnabled: boolean
    isLoading: boolean
    isReadOnly?: boolean
    storeConfiguration?: StoreConfiguration
    shopName: string
    label?: string

    setIsEmailChannelEnabled: (value: boolean) => void
    onEmailToggle: (storeConfiguration: StoreConfiguration) => void
}

export const EmailToggle = ({
    isEmailChannelEnabled,
    isLoading,
    isReadOnly = false,
    storeConfiguration,
    shopName,
    setIsEmailChannelEnabled,
    onEmailToggle,
    label = 'Email',
}: EmailToggleProps) => {
    const { routes } = useAiAgentNavigation({ shopName })

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
        const decision = { visible: isEmailChannelDisabled }

        const action = decision.visible ? (
            <Link to={routes.deployEmail} className={css.customToggleWarning}>
                <Text size="sm" variant="regular">
                    Connect an{' '}
                    <span className={css.emailAddress}>email address</span> to
                    enable the AI Agent
                </Text>
            </Link>
        ) : null

        return { visible: decision.visible, hint: '', action }
    }, [routes.deployEmail, isEmailChannelDisabled])

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
