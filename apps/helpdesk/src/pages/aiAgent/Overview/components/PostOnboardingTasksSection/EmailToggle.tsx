import React, { useMemo } from 'react'

import { Link } from 'react-router-dom'

import { Text } from '@gorgias/axiom'

import { StoreConfiguration } from 'models/aiAgent/types'
import { ChannelToggle } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/ChannelToggle'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import css from './EmailToggle.less'

type EmailToggleProps = {
    isEmailChannelEnabled: boolean
    setIsEmailChannelEnabled: (value: boolean) => void
    onEmailToggle: (storeConfiguration: StoreConfiguration) => void
    storeConfiguration?: StoreConfiguration
    shopName: string
    label?: string
}

export const EmailToggle = ({
    isEmailChannelEnabled,
    setIsEmailChannelEnabled,
    onEmailToggle,
    storeConfiguration,
    shopName,
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

    return (
        <ChannelToggle
            className={css.customToggle}
            color="var(--surface-inverted-default)"
            label={label}
            checked={isEmailChannelEnabled}
            disabled={isEmailChannelDisabled}
            onChange={handleEmailToggle}
            warnings={[
                {
                    visible: isEmailChannelDisabled,
                    hint: '',
                    action: (
                        <Link
                            to={routes.deployEmail}
                            className={css.customToggleWarning}
                        >
                            <Text size="sm" variant="regular">
                                Connect an{' '}
                                <span className={css.emailAddress}>
                                    email address
                                </span>{' '}
                                to enable the AI Agent
                            </Text>
                        </Link>
                    ),
                },
            ]}
            tooltip={{
                visible: false,
                content: '',
            }}
        />
    )
}
