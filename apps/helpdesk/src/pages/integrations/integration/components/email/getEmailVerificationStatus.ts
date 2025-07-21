import { EmailIntegration, GmailIntegration } from '@gorgias/helpdesk-queries'

import { IntegrationType, OutlookIntegration } from 'models/integration/types'

import {
    canIntegrationDomainBeVerified,
    isBaseEmailIntegration,
} from './helpers'

export enum EmailVerificationStatus {
    Verified = 'verified',
    UnverifiedEmail = 'unverified-email',
    UnverifiedDomain = 'unverified-domain',
    UnconnectedEmail = 'unconnected-email',
}

export const getEmailVerificationStatus = (
    integration: EmailIntegration | GmailIntegration | OutlookIntegration,
    domainVerification?: boolean,
): EmailVerificationStatus => {
    const isActive = !integration.deactivated_datetime
    const isForwardEmail = integration.type === IntegrationType.Email
    const isBaseIntegration = isBaseEmailIntegration(integration)
    const isVerified =
        ((integration as EmailIntegration).meta.verified ?? true) ||
        !isForwardEmail ||
        isBaseIntegration

    const canDomainBeVerified = canIntegrationDomainBeVerified(integration)
    const isGmailOutlookIntegration =
        !isForwardEmail && !canDomainBeVerified && isActive
    const isGorgiasEmailVerified =
        isForwardEmail && isVerified && !canDomainBeVerified

    if (isGorgiasEmailVerified || isGmailOutlookIntegration) {
        return EmailVerificationStatus.Verified
    }

    if (isForwardEmail && !isVerified) {
        return EmailVerificationStatus.UnverifiedEmail
    }

    if (!isActive && !isForwardEmail) {
        return EmailVerificationStatus.UnconnectedEmail
    }

    if (domainVerification) {
        return EmailVerificationStatus.UnverifiedDomain
    }

    return EmailVerificationStatus.Verified
}
