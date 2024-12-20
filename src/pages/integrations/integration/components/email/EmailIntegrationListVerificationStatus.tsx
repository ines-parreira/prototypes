import {EmailIntegration, GmailIntegration} from '@gorgias/api-queries'
import React from 'react'

import {OutlookIntegration} from 'models/integration/types'
import Button, {type ButtonProps} from 'pages/common/components/button/Button'
import Status, {StatusType} from 'pages/common/components/Status/Status'

import {canIntegrationDomainBeVerified} from './helpers'

type Props = {
    active: boolean
    isVerified: boolean
    isRowSubmitting: boolean
    redirectURI?: string
    isDomainVerificationWarningVisible: boolean
    isForwardEmail: boolean
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
}

export default function EmailIntegrationListVerificationStatus({
    active,
    isVerified,
    isRowSubmitting,
    redirectURI,
    isDomainVerificationWarningVisible,
    isForwardEmail,
    integration,
}: Props) {
    const commonButtonProps: Partial<ButtonProps> = {
        isLoading: isRowSubmitting,
        fillStyle: 'ghost',
        intent: 'secondary',
    }

    const canDomainBeVerified = canIntegrationDomainBeVerified(integration)

    if (isForwardEmail && isVerified && !canDomainBeVerified) {
        return null
    }

    if (!isForwardEmail && !canDomainBeVerified && active) {
        return null
    }

    if (isForwardEmail && !isVerified) {
        return (
            <Button {...commonButtonProps}>
                <Status type={StatusType.Error}>
                    Action Required: Verify Email
                </Status>
            </Button>
        )
    }

    if (!active && !isForwardEmail) {
        return (
            <Button
                {...commonButtonProps}
                onClick={(e) => {
                    e.preventDefault()
                    window.open(redirectURI)
                }}
            >
                <Status type={StatusType.Error}>
                    Action Required: Reconnect Email
                </Status>
            </Button>
        )
    }

    if (isDomainVerificationWarningVisible) {
        return (
            <Button {...commonButtonProps}>
                <Status type={StatusType.Error}>
                    Action Required: Verify Domain
                </Status>
            </Button>
        )
    }

    return (
        <Button {...commonButtonProps}>
            <Status type={StatusType.Success}>Verified</Status>
        </Button>
    )
}
