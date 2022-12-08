import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import {
    EmailIntegration,
    GmailIntegration,
    Integration,
    IntegrationType,
    OutlookIntegration,
    OutboundVerificationStatusValue,
} from 'models/integration/types'

export const isOutboundDomainVerified = (
    integration: EmailIntegration
): boolean => {
    return (
        integration.meta.outbound_verification_status?.domain ===
        OutboundVerificationStatusValue.Success
    )
}

export const getDomainFromEmailAddress = (address: string): string =>
    address.substring(address.lastIndexOf('@') + 1)

export const isGenericEmailIntegration = (
    integration: Integration
): integration is EmailIntegration | GmailIntegration | OutlookIntegration => {
    return (EMAIL_INTEGRATION_TYPES as IntegrationType[]).includes(
        integration.type
    )
}

export const isBaseEmailAddress = (emailAddress: string): boolean => {
    const forwardingEmailAddress =
        window.GORGIAS_STATE?.integrations?.authentication?.email
            ?.forwarding_email_address
    const forwardingAddressDomain = getDomainFromEmailAddress(
        forwardingEmailAddress ?? '@'
    )

    return emailAddress.endsWith(`@${forwardingAddressDomain}`)
}

export const isBaseEmailIntegration = (
    emailIntegration: EmailIntegration | GmailIntegration | OutlookIntegration
): boolean => {
    return isBaseEmailAddress(emailIntegration.meta.address)
}
