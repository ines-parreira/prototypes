import React from 'react'

import { EmailIntegration, GmailIntegration } from '@gorgias/helpdesk-queries'
import { Badge } from '@gorgias/merchant-ui-kit'

import { OutlookIntegration } from 'models/integration/types'

import { canIntegrationDomainBeVerified } from './helpers'

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
    isDomainVerificationWarningVisible,
    isForwardEmail,
    integration,
}: Props) {
    const canDomainBeVerified = canIntegrationDomainBeVerified(integration)
    const isGmailOutlookIntegration =
        !isForwardEmail && !canDomainBeVerified && active
    const isGorgiasEmailVerified =
        isForwardEmail && isVerified && !canDomainBeVerified

    if (isGorgiasEmailVerified || isGmailOutlookIntegration) {
        return (
            <Badge corner="round" type="light-success">
                <i className="material-icons-outlined">check_circle</i>
                Verified
            </Badge>
        )
    }

    if (isForwardEmail && !isVerified) {
        return (
            <Badge corner="round" type="light-error">
                <i className="material-icons-outlined">error</i>
                Verify Email
            </Badge>
        )
    }

    if (!active && !isForwardEmail) {
        return (
            <Badge corner="round" type="light-error">
                <i className="material-icons-outlined">error</i>
                Reconnect Email
            </Badge>
        )
    }

    if (isDomainVerificationWarningVisible) {
        return (
            <Badge corner="round" type="light-error">
                <i className="material-icons-outlined">error</i>
                Verify Domain
            </Badge>
        )
    }

    return (
        <Badge corner="round" type="light-success">
            <i className="material-icons-outlined">check_circle</i>
            Verified
        </Badge>
    )
}
